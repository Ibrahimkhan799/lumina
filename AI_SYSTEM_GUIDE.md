# Lumina AI System - Complete Usage Guide

## Overview

The Lumina AI system is a fully functional document management assistant that works through natural language. Ask the AI to create, search, rename, edit, archive, restore, or delete documents—and it will do exactly that with clear feedback on success or failure.

## Available Commands

### 1. Create Documents
Ask the AI to create one or more documents with specific titles.

**Examples:**
- "Create a document called Portfolio"
- "Create 3 documents about React"
- "Make a new document for my project plan"

**What Happens:**
- AI creates each document (one at a time)
- You'll see a confirmation: "✓ I've created 'Portfolio'"
- If it fails: "✗ Failed - Error: [reason]"

### 2. Find Documents
Ask the AI to search for documents by title or content.

**Examples:**
- "Find my React notes"
- "Search for documents about authentication"
- "What documents do I have about projects?"

**What Happens:**
- AI searches for matching documents
- Returns list of found documents with titles
- If nothing found: "Couldn't find documents matching that description"

### 3. Rename Documents
Ask the AI to rename a specific document.

**Examples:**
- "Rename Document 1 to My Project"
- "Change 'Old Name' to 'New Important Doc'"
- "Rename my main portfolio document"

**What Happens:**
- AI searches for the document by the old name
- If found, renames it
- Confirmation: "✓ I've renamed 'Old Name' to 'New Important Doc'"
- If not found: AI asks you to clarify which document

### 4. Edit Document Content
Ask the AI to add content to a document.

**Examples:**
- "Add content to my Portfolio about my projects"
- "Update the React notes with hooks information"
- "Edit Document 1 and add sections for skills"

**What Happens:**
- AI finds the document
- Generates appropriate content in BlockNote format
- Updates the document
- Confirmation: "✓ I've updated 'Portfolio' with project information"

### 5. Archive Documents
Ask the AI to archive (hide but keep) a document.

**Examples:**
- "Archive Document 1"
- "Archive my old notes"
- "Hide the project document"

**What Happens:**
- AI finds the document
- Archives it (still accessible from Archive view)
- Confirmation: "✓ I've archived 'Document 1'"

### 6. Restore Documents
Ask the AI to restore an archived document back to active.

**Examples:**
- "Restore my old notes"
- "Unarchive Document 1"
- "Bring back the project document"

**What Happens:**
- AI finds the archived document
- Restores it to active view
- Confirmation: "✓ I've restored 'Document 1'"

### 7. Delete Documents
Ask the AI to permanently delete a document.

**Examples:**
- "Delete Document 1"
- "Remove my temporary notes"
- "Delete the old project"

**What Happens:**
- AI finds the document
- Permanently deletes it (cannot be undone)
- Confirmation: "✓ I've permanently deleted 'Document 1'"
- **Warning**: This action cannot be reversed

### 8. List All Documents
Ask the AI to show all your documents.

**Examples:**
- "Show me all my documents"
- "What documents do I have?"
- "List everything"

**What Happens:**
- AI retrieves all non-archived documents
- Shows you the complete list with titles
- Returns count: "You have 5 documents"

## Error Handling

The AI provides clear error messages when things go wrong. Here are common scenarios:

### Document Not Found
```
"Couldn't find a document called 'Unknown Doc'. Did you mean one of these?
- My Portfolio
- Project Plan
- React Notes"
```
**Solution**: Use a more specific name or ask AI to list all documents

### Multiple Matches
```
"I found multiple documents matching 'Project'. Which one do you mean?
- Project Plan
- Project Ideas  
- Project Proposal"
```
**Solution**: Be more specific or use the exact document name

### Network Error
```
"✗ Failed - Error: Search failed due to network error. Please try again."
```
**Solution**: Check your internet connection and try again

### Permission Denied
```
"✗ Failed - Error: Unauthorized - You don't have permission to modify this document"
```
**Solution**: Contact the document owner or your administrator

### Invalid Input
```
"✗ Failed - Error: Document title is required"
```
**Solution**: Always provide a title when creating documents

## Tips for Best Results

### Be Specific
✅ Good: "Rename 'Portfolio' to 'My Creative Portfolio'"
❌ Avoid: "Rename the document"

### Use Exact Names (or close approximations)
✅ Good: "Edit my React Notes document"
❌ Avoid: "Edit the thing" (AI needs to search)

### For Multiple Actions, Be Clear
✅ Good: "Create 3 documents: React Notes, Vue Notes, Angular Notes"
❌ Avoid: "Make me some documents" (ambiguous)

### Describe What You Want
✅ Good: "Update my Portfolio with projects I've completed"
❌ Avoid: "Change something"

## Document Structure

Documents are stored in BlockNote format, which supports:
- **Headings** (3 levels: H1, H2, H3)
- **Paragraphs** (regular text)
- **Bullet Lists**
- **Numbered Lists**
- **Code Blocks**

When AI generates content, it automatically formats it appropriately based on the request.

## Keyboard Shortcuts in AI Sidebar

- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Escape**: Close sidebar
- **Click ⤢**: Expand sidebar for detailed view
- **Click chevron**: Collapse sidebar

## Status Indicators

When AI is working, you'll see status indicators for each action:

- **✓ Done** (green): Action completed successfully
- **✗ Failed** (red): Action failed - check the error message
- **Running…** (yellow, pulsing): Action in progress
- **● ● ●** (bouncing dots): AI is thinking

## Example Conversation

```
User: "Create 3 documents about web development"

AI: Creates:
  ✓ Web Development Document 1
  ✓ Web Development Document 2
  ✓ Web Development Document 3

User: "Rename the first one to HTML Basics"

AI: ✓ I've renamed 'Web Development Document 1' to 'HTML Basics'

User: "Add CSS tips to HTML Basics"

AI: ✓ I've updated 'HTML Basics' with CSS information

User: "Archive the other two"

AI: ✓ I've archived 'Web Development Document 2'
    ✓ I've archived 'Web Development Document 3'

User: "Show me all my documents"

AI: You have 1 active document:
    - HTML Basics
    
    (2 archived documents available)
```

## Troubleshooting

### AI isn't responding
1. Check your internet connection
2. Wait a few seconds (Groq model might be slow)
3. Try a simpler request first
4. Check browser console for errors

### Document doesn't appear
1. Try refreshing the page
2. Check if it was archived instead
3. Ask AI to list all documents
4. Check for typos in the document name

### Changes aren't saved
1. Wait for the ✓ Done indicator
2. Check if there was a ✗ Failed indicator with an error
3. Refresh the page to see if changes persisted
4. Try again - might be a temporary issue

### AI is making mistakes
1. Be more specific with document names
2. Use exact titles instead of descriptions
3. Try asking in a different way
4. Break complex requests into simpler steps

## API Endpoints (For Developers)

### POST /api/chat
- Handles all AI chat messages
- Input: `{ messages: [...] }`
- Output: Streamed text response with tool calls

### POST /api/chat/mutations
- Handles document operations
- Actions: createDocument, updateDocument, archiveDocument, restoreDocument, deleteDocument
- Requires Clerk auth token

### POST /api/documents/search
- Searches for documents
- Methods: searchByTitle, searchByContent, listAll
- Used internally by AI tools

## System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Active internet connection
- Clerk authentication
- Convex backend connection

## Known Limitations

1. **One document at a time**: AI creates/modifies documents one by one
2. **No bulk operations**: Can't move multiple documents to a folder at once
3. **Text only**: Rich media (images, videos) not yet supported
4. **No collaborative editing**: Real-time collaboration not available
5. **Groq rate limits**: May be slow during peak hours

## Privacy & Security

- All requests are authenticated via Clerk
- Documents are stored in Convex backend
- AI model is Groq's Llama 3.3 (no data retention)
- Your conversation history is managed by Convex

## Getting Help

If something isn't working:
1. Check this guide for common issues
2. Look at error messages - they usually tell you what's wrong
3. Try simpler requests first
4. Check browser console for technical errors
5. Contact support if problems persist
