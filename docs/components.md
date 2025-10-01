# 🧩 Components Library

## Quick Add Components

```bash
radnt add button card input    # Multiple at once
radnt add --all               # Everything
```

## Available Components

### Form Components
- **button** - Customizable button with variants
- **input** - Text input with validation styles  
- **checkbox** - Accessible checkbox component
- **select** - Dropdown select component
- **textarea** - Multi-line text input
- **form** - Form with validation

### Layout Components  
- **card** - Content container with header/footer
- **separator** - Visual divider line
- **sheet** - Slide-out panel component
- **dialog** - Modal dialog overlay
- **popover** - Floating content container

### Data Display
- **table** - Responsive data table
- **badge** - Status/category labels
- **avatar** - User profile images
- **progress** - Loading/progress bars
- **skeleton** - Loading placeholders

### Navigation
- **tabs** - Tabbed content switcher
- **breadcrumb** - Navigation breadcrumbs
- **navigation-menu** - Main navigation
- **menubar** - Menu bar component

### Feedback
- **alert** - Alert messages
- **toast** - Notification toasts
- **tooltip** - Hover tooltips

## Usage Examples

### Button Component
```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🚀</Button>
```

### Card Component
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Table Component
```tsx
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Dialog Component
```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input id="name" value="Pedro Duarte" className="col-span-3" />
      </div>
    </div>
  </DialogContent>
</Dialog>
```

## Pro Tips

- **All components are fully typed** with TypeScript
- **Built-in dark mode support** - No extra configuration needed
- **Accessible by default** - ARIA compliant out of the box
- **Customizable with Tailwind** - Use utility classes to customize
- **Copy-paste friendly** - Components work standalone
