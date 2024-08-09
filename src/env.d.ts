/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
    NFT_CONTRACT: string;
    MARKETPLACE_CONTRACT: string;
    CHAIN_ID: string;
    CHAIN_RPC: string | undefined;
    BACKEND_URL: string;
  }
}
