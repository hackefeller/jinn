import { theme } from './colors.js';

const BANNER = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ██████╗ ██╗     ██████╗  ██████╗ ███████╗ ██████╗      ║
║  ██╔════╝ ██║     ██╔══██╗██╔═══██╗██╔════╝██╔═══██╗     ║
║  ██║  ███╗██║     ██████╔╝██║   ██║███████╗██████╔╝      ║
║  ██║   ██║██║     ██╔══██╗██║   ██║╚════██║██╔══██╗      ║
║  ╚██████╔╝███████╗██████╔╝╚██████╔╝███████║██║  ██║      ║
║   ╚═════╝ ╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝      ║
║                                                            ║
║   Your Magical AI Assistant                                ║
╚════════════════════════════════════════════════════════════╝
`;

export function displayBanner(): void {
  console.log(theme.banner.border(BANNER));
}

export function displaySubtitle(text: string): void {
  console.log(theme.banner.subtitle(`  ${text}\n`));
}
