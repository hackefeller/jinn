import { McpOAuthProvider } from "../../execution/mcp-oauth/provider";

export interface LoginOptions {
  serverUrl?: string;
  clientId?: string;
  scopes?: string[];
}

type TokenDataLike = {
  expiresAt?: number;
};

export interface LoginDeps {
  createProvider?: (options: { serverUrl: string; clientId?: string; scopes?: string[] }) => {
    login: () => Promise<TokenDataLike>;
  };
}

export async function login(
  serverName: string,
  options: LoginOptions,
  deps?: LoginDeps,
): Promise<number> {
  try {
    const serverUrl = options.serverUrl;
    if (!serverUrl) {
      console.error(`Error: --server-url is required for server "${serverName}"`);
      return 1;
    }

    const createProvider =
      deps?.createProvider ??
      ((providerOptions: { serverUrl: string; clientId?: string; scopes?: string[] }) =>
        new McpOAuthProvider(providerOptions));
    const provider = createProvider({
      serverUrl,
      clientId: options.clientId,
      scopes: options.scopes,
    });

    console.log(`Authenticating with ${serverName}...`);
    const tokenData = await provider.login();

    console.log(`✓ Successfully authenticated with ${serverName}`);
    if (tokenData.expiresAt) {
      const expiryDate = new Date(tokenData.expiresAt * 1000);
      console.log(`  Token expires at: ${expiryDate.toISOString()}`);
    }

    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: Failed to authenticate with ${serverName}: ${message}`);
    return 1;
  }
}
