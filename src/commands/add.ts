import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

// Helper function for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

const availableComponents = [
  { name: 'accordion', description: 'A vertically stacked set of interactive headings' },
  { name: 'alert', description: 'Displays a callout for user attention' },
  { name: 'alert-dialog', description: 'A modal dialog that interrupts the user' },
  { name: 'avatar', description: 'An image element with a fallback for representing the user' },
  { name: 'badge', description: 'Displays a badge or a component that looks like a badge' },
  { name: 'breadcrumb', description: 'Displays the path to the current resource' },
  { name: 'calendar', description: 'A date field component that allows users to enter and edit date' },
  { name: 'checkbox', description: 'A control that allows the user to toggle between checked and not checked' },
  { name: 'collapsible', description: 'An interactive component which expands/collapses a panel' },
  { name: 'combobox', description: 'Combines a text input with a listbox' },
  { name: 'command', description: 'Fast, composable, unstyled command menu' },
  { name: 'context-menu', description: 'Displays a menu to the user' },
  { name: 'data-table', description: 'Powerful table and datagrids built using TanStack Table' },
  { name: 'date-picker', description: 'A date picker component with range and presets' },
  { name: 'dialog', description: 'A window overlaid on either the primary window or another dialog window' },
  { name: 'dropdown-menu', description: 'Displays a menu to the user' },
  { name: 'form', description: 'Building forms with validation and accessibility' },
  { name: 'hover-card', description: 'For sighted users to preview content available behind a link' },
  { name: 'menubar', description: 'A visually persistent menu common in desktop applications' },
  { name: 'navigation-menu', description: 'A collection of links for navigating websites' },
  { name: 'popover', description: 'Displays rich content in a portal, triggered by a button' },
  { name: 'progress', description: 'Displays an indicator showing the completion progress' },
  { name: 'radio-group', description: 'A set of checkable buttons—known as radio buttons' },
  { name: 'scroll-area', description: 'Augments native scroll functionality for custom, cross-browser styling' },
  { name: 'select', description: 'Displays a list of options for the user to pick from' },
  { name: 'separator', description: 'Visually or semantically separates content' },
  { name: 'sheet', description: 'Extends the Dialog component to display content that complements the main content' },
  { name: 'skeleton', description: 'Use to show a placeholder while content is loading' },
  { name: 'slider', description: 'An input where the user selects a value from within a given range' },
  { name: 'switch', description: 'A control that allows the user to toggle between checked and not checked' },
  { name: 'table', description: 'A responsive table component' },
  { name: 'tabs', description: 'A set of layered sections of content' },
  { name: 'textarea', description: 'Displays a form textarea or a component that looks like a textarea' },
  { name: 'toast', description: 'A succinct message that is displayed temporarily' },
  { name: 'toggle', description: 'A two-state button that can be either on or off' },
  { name: 'toggle-group', description: 'A set of two-state buttons that can be toggled on or off' },
  { name: 'tooltip', description: 'A popup that displays information related to an element' }
];

export async function addComponent(componentName?: string, options: any = {}) {
  console.log(chalk.blue.bold('📦 Adding shadcn/ui components...\n'));

  // Check if we're in a valid project
  const componentsJsonPath = path.join(process.cwd(), 'components.json');
  if (!await fs.pathExists(componentsJsonPath)) {
    console.error(chalk.red('❌ No components.json found. Run "radnt init" first.'));
    process.exit(1);
  }
  let componentsToAdd: string[] = [];

  if (options.all) {
    componentsToAdd = availableComponents.map(c => c.name);
  } else if (componentName) {
    // Check for exact match first
    let component = availableComponents.find(c => c.name === componentName);
    
    // If not found, check for close matches (typos)
    if (!component) {
      const closeMatches = availableComponents.filter(c => 
        c.name.includes(componentName) || 
        componentName.includes(c.name) ||
        levenshteinDistance(c.name, componentName) <= 2
      );
      
      if (closeMatches.length === 1) {
        component = closeMatches[0];
        console.log(chalk.yellow(`Did you mean "${component.name}"? Using that instead.`));
      } else if (closeMatches.length > 1) {
        console.error(chalk.red(`❌ Component "${componentName}" not found.`));
        console.log(chalk.yellow('Did you mean one of these?'));
        closeMatches.forEach(comp => {
          console.log(chalk.cyan(`  • ${comp.name}`) + chalk.gray(` - ${comp.description}`));
        });
        const { selectedComponent } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedComponent',
            message: 'Select the correct component:',
            choices: closeMatches.map(c => ({
              name: c.name,
              value: c.name
            }))
          }
        ]);
        component = availableComponents.find(c => c.name === selectedComponent);
      } else {
        console.error(chalk.red(`❌ Component "${componentName}" not found.`));
        console.log(chalk.yellow('Available components:'));
        availableComponents.forEach(comp => {
          console.log(chalk.cyan(`  • ${comp.name}`) + chalk.gray(` - ${comp.description}`));
        });
        return;
      }
    }
    componentsToAdd = [component!.name];
  } else {
    // Interactive selection
    const { selectedComponents } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedComponents',
        message: 'Which components would you like to add?',
        choices: availableComponents.map(c => ({
          name: `${c.name} - ${c.description}`,
          value: c.name,
          short: c.name
        })),
        pageSize: 15
      }
    ]);

    if (selectedComponents.length === 0) {
      console.log(chalk.yellow('No components selected.'));
      return;
    }

    componentsToAdd = selectedComponents;
  }

  const spinner = ora('Adding components...').start();

  try {
    for (const component of componentsToAdd) {
      spinner.text = `Adding ${component}...`;
      await addSingleComponent(component);
    }

    spinner.succeed(`Successfully added ${componentsToAdd.length} component(s)!`);
    
    console.log(chalk.green('\n✨ Components added successfully!'));
    console.log(chalk.cyan('You can now import and use them in your project:'));
    componentsToAdd.forEach(component => {
      console.log(chalk.gray(`  import { ${toPascalCase(component)} } from "@/components/ui/${component}"`));
    });

  } catch (error) {
    spinner.fail('Failed to add components');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function addSingleComponent(componentName: string) {
  const componentPath = path.join(process.cwd(), 'src/components/ui', `${componentName}.tsx`);
  
  // Check if component already exists
  if (await fs.pathExists(componentPath)) {
    console.log(chalk.yellow(`⚠️  Component ${componentName} already exists, skipping...`));
    return;
  }

  // Get component content based on name
  const componentContent = getComponentContent(componentName);
  
  if (!componentContent) {
    throw new Error(`Component ${componentName} is not implemented yet`);
  }

  // Ensure directory exists
  await fs.ensureDir(path.dirname(componentPath));
  
  // Write component file
  await fs.writeFile(componentPath, componentContent);
}

function getComponentContent(componentName: string): string | null {
  const components: Record<string, string> = {
    'alert': `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }`,

    'badge': `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }`,

    'accordion': `"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }`,

    'table': `import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}`,

    'separator': `import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }`,

    'skeleton': `import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }`,

    'avatar': `import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }`
  };

  return components[componentName] || null;
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
