# Context7 Research Rules

## Overview
Context7 is our primary tool for researching libraries, code samples, and documentation. It provides up-to-date, version-specific code examples directly from source repositories, eliminating outdated or hallucinated code examples.

## Rule: Context7 First Stop
**When researching any libraries, frameworks, or code samples, Context7 MUST be used as the first stop before any other research method.**

## Usage Protocol

### 1. Always Start with Context7
Before using any other research methods (web search, documentation sites, Stack Overflow, etc.), first attempt to get information using Context7.

### 2. How to Use Context7
Add "use context7" to your research prompt:

**Example:**
```
use context7: How do I set up authentication with Supabase in a Next.js app?
```

**Example:**
```
use context7: Show me how to implement pagination with React Query
```

**Example:**
```
use context7: What's the latest syntax for Framer Motion animations?
```

### 3. Context7 Configuration
- **Location**: `.mcp.json` in project root
- **Server**: `@upstash/context7-mcp` via npx
- **API Key**: Optional but recommended for higher rate limits
- **Status**: ✅ Configured and ready to use

## Benefits of Using Context7

1. **Up-to-date Information**: Pulls directly from latest library documentation
2. **Version-specific**: Gets code examples for the specific version you're using
3. **Accurate Examples**: Eliminates hallucinated or outdated code samples
4. **Comprehensive Coverage**: Works with most popular libraries and frameworks
5. **Real-time**: Always reflects the current state of documentation

## Fallback Research Methods

Only use these methods if Context7 doesn't provide sufficient information:

1. **WebFetch tool**: For specific documentation pages
2. **WebSearch tool**: For broader research and recent discussions
3. **Official documentation**: When you need comprehensive guides
4. **Community resources**: Stack Overflow, GitHub issues, etc.

## Example Workflow

```
1. ✅ First: "use context7: How to implement image uploads in Next.js?"
2. 📝 Evaluate: Did Context7 provide sufficient, accurate information?
3. 🔄 If insufficient: Use WebFetch for official docs
4. 🔍 If still insufficient: Use WebSearch for community solutions
5. 📚 Document findings for future reference
```

## Integration with Development Process

- **Before implementing any new library**: Use Context7 to understand current best practices
- **When debugging**: Use Context7 to verify you're using the latest API correctly  
- **During code reviews**: Use Context7 to suggest modern alternatives or improvements
- **When writing documentation**: Use Context7 to ensure examples are current

## Maintenance

- Configuration is stored in `.mcp.json` and should be committed to version control
- No API key required for basic usage, but recommended for higher rate limits
- Context7 automatically updates its knowledge base, no manual updates needed

---

**Remember: Context7 first, everything else second!** 🎯