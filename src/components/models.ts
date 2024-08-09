import { Pokedex } from '@fairfooddata/types';

// export type ContractList = { [key: string]: string[] };

export type TokenList = {
  tokenId: string;
  hashes: string[];
}[];

export interface NftMetadata {
  swarmReference: string;
  content: Pokedex;
}
