# 💡 Examples

## Quick Start Examples

### Create and Run a Basic App
```bash
# Create new project
radnt create my-app

# Navigate and start
cd my-app
radnt dev

# Add components
radnt add button card input

# Build for production
npm run build
```

### Dashboard Application
```bash
# Create dashboard
radnt create admin-dashboard --template dashboard

cd admin-dashboard

# Add additional components
radnt add table chart badge progress

# Start development
radnt dev --port 3000
```

## Component Usage Examples

### Building a Login Form
```tsx
// src/app/login/page.tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full">Sign In</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Data Table with Actions
```tsx
// src/components/users-table.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive" },
]

export function UsersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">Edit</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Modal Dialog Example
```tsx
// src/components/create-user-dialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Add a new user to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Layout Examples

### Dashboard Layout
```tsx
// src/app/dashboard/layout.tsx
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
```

### Sidebar Component
```tsx
// src/components/sidebar.tsx
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <Separator />
      <nav className="p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          Overview
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Users
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Settings
        </Button>
      </nav>
    </div>
  )
}
```

## API Integration Examples

### Data Fetching with Server Components
```tsx
// src/app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Posts</h1>
      <div className="grid gap-4">
        {posts.map((post: any) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{post.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### Client-side Data Fetching
```tsx
// src/components/posts-client.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostsClient() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <Card key={post.id}>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{post.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## Form Examples

### Contact Form with Validation
```tsx
// src/components/contact-form.tsx
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

## E-commerce Examples

### Product Card
```tsx
// src/components/product-card.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full"
        />
        <Badge className="absolute top-2 right-2">
          {product.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-2xl font-bold text-primary">
          ${product.price}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}
```

### Shopping Cart
```tsx
// src/components/shopping-cart.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function ShoppingCart() {
  const cartItems = [
    { id: 1, name: "Product 1", price: 29.99, quantity: 2 },
    { id: 2, name: "Product 2", price: 49.99, quantity: 1 },
  ]

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          Cart
          <Badge className="ml-2">{cartItems.length}</Badge>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button className="w-full">Checkout</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

## Migration Examples

### Upgrading Existing Project
```bash
# Navigate to existing Next.js project
cd my-existing-project

# Initialize Radnt
radnt init

# Add components you need
radnt add button card input table

# Upgrade to modern design
radnt upgrade

# Fix any compatibility issues
radnt fix
```

### Converting from Create React App
```bash
# Create new Next.js project with Radnt
radnt create my-migrated-app

# Copy your components
cp -r old-app/src/components new-app/src/components

# Update imports (React Router → Next.js routing)
# Update API calls (axios → fetch)
# Update styling (CSS modules → Tailwind)
```

## Deployment Examples

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
```

### Docker Deployment
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t my-radnt-app .
docker run -p 3000:3000 my-radnt-app
```
