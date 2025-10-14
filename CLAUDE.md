# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LB Kitchen is building a Clover POS-centered multi-channel ordering system for their Nigerian food business. The system integrates Framer (frontend), Netlify Functions (API gateway), and Clover (payments/inventory) to reduce costs and improve operations.

## Multi-Agent Development System - Agent Roles

These project uses Claude Code or AI assistant for development. There are predefined roles and development sequencing when making changes and imporvements to this code base. You muat act as the orchestrator and use the agents and subagents avaiable to you that are relevant for each task or prompto. Writing system prompts to them to trigger work or research. All the roles and development procedures documented in `CLAUDE_Developemt_Processes.md` .

## Session Setup

### MCP Server Configuration
**MANDATORY**: At the start of every coding session, ensure the Figma Desktop MCP server is connected:

```bash
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```

This enables direct integration with Figma designs for component development and design system alignment.

## Research Protocol

### Context7 First Rule
**MANDATORY**: When researching any libraries, frameworks, or code samples, Context7 MUST be used as the first stop before any other research method. 

- Use the prompt format: "use context7: [your research question]"
- Context7 provides up-to-date, version-specific documentation directly from source repositories
- Only use fallback research methods (WebFetch, WebSearch) if Context7 is insufficient
- Full details in `CONTEXT7_RESEARCH_RULES.md`


## Architecture

### System Components
- **Framer Website**: Marketing site with progressive ordering forms
- **Netlify Functions**: Serverless API gateway proxying Clover API calls
- **Clover POS**: Central hub for payments, inventory, and reporting
- **Catering System**: React-based dashboard for quote generation
- **Customer Database**: Hybrid approach using Clover + external database

### Key Integration Points
- Clover REST API for inventory and order management
- Real-time inventory sync via webhooks
- Progressive ordering flow with educational UX for Nigerian cuisine
- PCI-compliant payment processing via Clover hosted checkout

## Development Commands

### Netlify Functions Development
```bash
# Install dependencies (if package.json exists)
npm install

# Run local development server
netlify dev

# Deploy to production
netlify deploy --prod

# Test function locally
curl http://localhost:8888/.netlify/functions/fetch-menu
```

### Environment Setup
Required environment variables:
- `CLOVER_API_TOKEN`: Clover API authentication token
- `CLOVER_MERCHANT_ID`: 13-character merchant identifier
- `CLOVER_ENVIRONMENT`: 'sandbox' or 'production'

### API Testing
```bash
# Test Clover API connectivity (sandbox)
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
"https://apisandbox.dev.clover.com/v3/merchants/YOUR_MERCHANT_ID/items"

# Test Netlify function
curl https://your-site.netlify.app/.netlify/functions/fetch-menu
```

## Core Clover API Endpoints

```javascript
// Inventory management
GET /v3/merchants/{mId}/items?expand=categories,modifierGroups,itemStock
GET /v3/merchants/{mId}/categories
GET /v3/merchants/{mId}/modifier_groups

// Order processing
POST /v3/merchants/{mId}/orders
POST /v3/merchants/{mId}/orders/{orderId}/line_items
GET /v3/merchants/{mId}/orders/{orderId}

// Customer management
GET /v3/merchants/{mId}/customers
POST /v3/merchants/{mId}/customers
```

## Project Structure

```
lb-kitchen-test/
├── netlify/
│   └── functions/         # Serverless API functions
│       └── fetch-menu.js  # Menu fetching endpoint
├── netlify.toml          # Netlify configuration
├── .env                  # Environment variables (local only)
└── components/           # React/Framer components
```

## Key Implementation Details

### Netlify Function Pattern
All API functions follow this structure:
1. Enable CORS for Framer integration
2. Handle OPTIONS preflight requests
3. Validate environment variables
4. Make authenticated Clover API calls
5. Transform data for frontend consumption
6. Return standardized response format

### Data Transformation
Clover prices are in cents - divide by 100 for display. Stock quantities come from `itemStock.quantity`. Hidden items should be filtered out.

### Error Handling
Always return structured error responses with `success: false` and meaningful error messages. Log errors for debugging but don't expose sensitive details to frontend.

## Current Implementation Status

### Completed
- Basic project structure documentation
- Clover API integration guide for menu fetching
- Netlify Functions setup with CORS handling
- Framer component example for displaying menu items

### Not Yet Implemented
- Order processing workflow
- Customer database integration
- Catering quote system
- Webhook handlers for real-time updates
- Authentication and session management
- Production deployment configuration

## Development Workflow

1. Test all Clover API calls in sandbox environment first
2. Use Netlify Functions as proxy to handle authentication
3. Transform data appropriately for frontend consumption
4. Implement proper error handling at each layer
5. Test end-to-end flow before production deployment

## Important Considerations

- Never expose Clover API tokens in frontend code
- All API calls must go through Netlify Functions
- Maintain PCI compliance by using Clover hosted checkout
- Cache frequently accessed data to avoid rate limits
- Implement webhook retry logic for reliability