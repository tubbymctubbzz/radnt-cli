export interface ProjectConfig {
  projectName: string;
  template: Template;
  typescript: boolean;
  tailwind: boolean;
  eslint: boolean;
  appRouter: boolean;
  shadcn: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export type Template = 'basic' | 'dashboard' | 'ecommerce' | 'blog' | 'portfolio';

export interface ComponentConfig {
  name: string;
  dependencies?: string[];
  files: ComponentFile[];
}

export interface ComponentFile {
  path: string;
  content: string;
}

export interface DevServerConfig {
  port: number;
  host: string;
  open?: boolean;
  https?: boolean;
}

export interface ShadcnConfig {
  style: 'default' | 'new-york';
  baseColor: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone';
  cssVariables: boolean;
  rsc: boolean;
  tsx: boolean;
  tailwind: {
    config: string;
    css: string;
    baseColor: string;
    cssVariables: boolean;
  };
  aliases: {
    components: string;
    utils: string;
  };
}
