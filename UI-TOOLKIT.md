# UI Toolkit Guide - Chakra UI v3

This document outlines the correct usage patterns for Chakra UI v3 components in this project.

## Alert Component

### Chakra UI v3 Structure
```tsx
<Alert.Root>
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Title />
    <Alert.Description />
  </Alert.Content>
</Alert.Root>
```

### Status Variants
- `status="error"` - Red error alerts
- `status="warning"` - Orange warning alerts  
- `status="success"` - Green success alerts
- `status="info"` - Blue info alerts

### Example Usage
```tsx
// Error Alert
<Alert.Root status="error">
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Title>Error Title</Alert.Title>
    <Alert.Description>Error description text</Alert.Description>
  </Alert.Content>
</Alert.Root>

// Simple Alert (description only)
<Alert.Root status="success">
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Description>Success message</Alert.Description>
  </Alert.Content>
</Alert.Root>
```

### Migration from v2
- Replace `<Alert>` with `<Alert.Root>`
- Replace `<AlertIcon />` with `<Alert.Indicator />`
- Wrap text content in `<Alert.Content><Alert.Description>...</Alert.Description></Alert.Content>`
- Add `<Alert.Title>` for titles when needed

## Other v3 Component Patterns

### Dialog
```tsx
<Dialog.Root>
  <Dialog.Backdrop />
  <Dialog.Positioner>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title />
      </Dialog.Header>
      <Dialog.Body />
      <Dialog.Footer />
      <Dialog.CloseTrigger />
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

### Tabs
```tsx
<Tabs.Root>
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content</Tabs.Content>
</Tabs.Root>
```

### Card
```tsx
<Card.Root>
  <Card.Header>
    <Card.Title />
  </Card.Header>
  <Card.Body />
  <Card.Footer />
</Card.Root>
```

## Common Mistakes to Avoid

### Alert Component
❌ **Incorrect (v2 pattern):**
```tsx
<Alert status="error">
  <AlertIcon />
  <Text>Error message</Text>
</Alert>
```

✅ **Correct (v3 pattern):**
```tsx
<Alert.Root status="error">
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Description>Error message</Alert.Description>
  </Alert.Content>
</Alert.Root>
```

## Verification Checklist
When migrating components:
- [ ] Replace `<Alert>` with `<Alert.Root>`
- [ ] Replace `<AlertIcon />` with `<Alert.Indicator />`
- [ ] Wrap text in `<Alert.Content><Alert.Description>...</Alert.Description></Alert.Content>`
- [ ] Test build after changes
- [ ] Verify visual styling is preserved

## Notes
- Always use the compound component structure with `.Root`, `.Content`, etc.
- Check Chakra UI v3 documentation for the latest patterns
- Test components after migration to ensure proper styling and functionality
- Be systematic: search for old patterns, document the fix, then apply consistently