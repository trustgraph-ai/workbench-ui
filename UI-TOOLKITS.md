# UI Toolkits and Framework Notes

## Chakra UI Version

**CRITICAL**: This project uses **Chakra UI v3**, NOT v2. Always check component APIs against v3 documentation.

## Key Chakra v3 Migration Points

### Modal → Dialog
```tsx
// ❌ Chakra v2
<Modal isOpen={open} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Title</ModalHeader>
    <ModalBody>Content</ModalBody>
  </ModalContent>
</Modal>

// ✅ Chakra v3
<Dialog.Root open={open} onOpenChange={(x) => onOpenChange(x.open)}>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>Content</Dialog.Body>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
```

### Toast System
```tsx
// ❌ Chakra v2
const toast = useToast();
toast({ title: "Success", status: "success" });

// ✅ Chakra v3
import { toaster } from "../ui/toaster";
toaster.create({ title: "Success", status: "success" });
```

### Form Components
```tsx
// ❌ Chakra v2
<FormControl>
  <FormLabel>Label</FormLabel>
  <Input />
</FormControl>

// ✅ Chakra v3
<Field.Root>
  <Field.Label>Label</Field.Label>
  <Input />
</Field.Root>
```

### Tabs Structure
```tsx
// ❌ Chakra v2
<Tabs>
  <TabList>
    <Tab>Tab 1</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Content</TabPanel>
  </TabPanels>
</Tabs>

// ✅ Chakra v3
<Tabs.Root>
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content</Tabs.Content>
</Tabs.Root>
```

### Menu Components
```tsx
// ❌ Chakra v2
<Menu>
  <MenuButton>Button</MenuButton>
  <MenuList>
    <MenuItem>Item</MenuItem>
  </MenuList>
</Menu>

// ✅ Chakra v3
<Menu.Root>
  <Menu.Trigger>Button</Menu.Trigger>
  <Menu.Content>
    <Menu.Item>Item</Menu.Item>
  </Menu.Content>
</Menu.Root>
```

### Props Changes
```tsx
// ❌ Chakra v2 props
colorScheme="blue"
isDisabled={true}

// ✅ Chakra v3 props
colorPalette="blue"
disabled={true}
```

### Layout Components
```tsx
// ❌ Chakra v2
<Divider />

// ✅ Chakra v3
<Separator />
```

### Input Groups (Simplified)
```tsx
// ❌ Chakra v2
<InputGroup>
  <InputLeftElement>🔍</InputLeftElement>
  <Input placeholder="Search..." />
</InputGroup>

// ✅ Chakra v3 (simplified approach)
<Input placeholder="🔍 Search..." />
```

### Avatar Structure
```tsx
// ❌ Chakra v2
<Avatar name="John Doe" />

// ✅ Chakra v3
<Avatar.Root>
  <Avatar.Fallback name="John Doe" />
</Avatar.Root>
```

## Layout Components Still Work

**Important**: VStack, HStack, Box, Grid, GridItem, Text, Button, Input, etc. still work the same way in v3. The confusion around VStack/HStack causing "invalid component type" errors is usually due to **circular import dependencies**, not Chakra version issues.

## Common Debugging Steps

1. **Check imports**: Ensure all Chakra components are imported from `@chakra-ui/react`
2. **Verify component structure**: Use the v3 nested component patterns (Component.Root, Component.Trigger, etc.)
3. **Check props**: Use `colorPalette` instead of `colorScheme`, `disabled` instead of `isDisabled`
4. **Circular imports**: If getting "invalid component type" errors with basic components like VStack, check for circular import dependencies

## Project-Specific Patterns

### Notifications
**DO NOT** use the toaster directly. Instead, use the `useNotification` hook:

```tsx
// ❌ Don't do this
import { toaster } from "../ui/toaster";
toaster.create({ title: "Success", status: "success" });

// ✅ Do this instead
import { useNotification } from "../../state/notify";

const notify = useNotification();
notify.success("Operation completed successfully");
notify.error("Something went wrong");
notify.info("FYI: This is informational");
```

### Common Components
**ALWAYS** prefer using pre-built components from `src/components/common/` instead of raw Chakra components. These components handle Chakra v3 APIs correctly and reduce boilerplate:

```tsx
// ❌ Don't use raw Chakra components
<Field.Root required>
  <Field.Label>Name</Field.Label>
  <Input value={value} onChange={(e) => setValue(e.target.value)} />
</Field.Root>

// ✅ Use common components instead
<TextField 
  label="Name" 
  value={value} 
  onValueChange={setValue} 
  required 
/>
```

**Available Common Components:**
- `TextField` - Text input with label and validation
- `TextAreaField` - Multi-line text input  
- `SelectField` - Dropdown select with rich options
- `BasicTable` - Pre-configured Tanstack Table
- `Card` - Consistent card layout with title/description
- `ProgressSubmitButton` - Submit button with loading state
- `PageHeader` - Standard page header layout
- `StatusBadge` - Consistent status indicators
- `CenterSpinner` - Loading spinner
- `ChipInputField` - Tag/chip input field
- `NumberField` - Numeric input with validation
- `Slider` - Range slider component

### Theming and Colors
**ALWAYS** use semantic color tokens instead of direct color palettes. The theme provides semantic tokens that automatically handle light/dark mode:

```tsx
// ❌ Don't use direct color palettes
colorPalette="blue"
bg="gray.100"
color="deepPlum.700"

// ✅ Use semantic tokens instead
colorPalette="primary"
bg="bg.muted" 
color="primary.fg"
```

**Available Semantic Color Palettes:**
- `primary` - Main brand color (airForceBlue)
- `accent` - Secondary brand color (deepPlum)
- `observing` - For observation callouts (warmNeutral)
- `thinking` - For thinking callouts (deepPlum variants)
- `insightful` - For answer callouts (neutralGreen)

**Semantic Token Structure:**
Each palette has these variants:
- `.solid` - Strong, high contrast (buttons, badges)
- `.contrast` - Text on solid backgrounds
- `.fg` - Foreground text color
- `.muted` - Subtle backgrounds
- `.subtle` - Light backgrounds
- `.emphasized` - Medium emphasis backgrounds
- `.focusRing` - Focus indicators

**Background/Text Tokens:**
- `background` - Main page background
- `text` - Main text color
- `bg.muted` - Subtle background areas
- `fg.muted` - Muted text

### Other Patterns
- Use Tanstack Query for state management with existing socket-based config API
- Follow kebab-case naming conventions for IDs and URLs
- Use existing table patterns with Tanstack Table