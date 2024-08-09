<template>
  <q-page-sticky :offset="[24, 24]">
    <q-btn fab icon="refresh" @click="reload" />
  </q-page-sticky>

  <div v-if="listRequest.isLoading.value" class="fixed-center">
    <div class="column content-center items-center">
      <q-spinner size="4em" />
      <div class="q-py-md">Fetching NFTs</div>
    </div>
  </div>
  <div v-else-if="listRequest.error.value" class="fixed-center">
    <div class="column content-center items-center">
      <q-icon name="error" size="4em" />
      <div class="q-py-md">{{ listRequest.error }}</div>
    </div>
  </div>
  <div v-else class="row">
    <NftCard
      v-for="tokenId in listRequest.state.value"
      :tokenId="tokenId"
      :key="tokenId.toString()"
    />
  </div>
</template>

<script setup lang="ts">
import NftCard from './NftCard.vue';
import { useAsyncState } from '@vueuse/core';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { getContract } from 'thirdweb';
import { useAccountStore } from 'src/stores/account';
import assert from 'assert';
import { getAllListings, totalListings } from 'thirdweb/extensions/marketplace';
import { useListingsStore } from 'src/stores/listings';

const { chain, client, account } = useAccountStore();

const listRequest = useAsyncState<bigint[]>(async () => {
  assert(process.env.NFT_CONTRACT);
  assert(account);

  const contract = getContract({
    address: process.env.NFT_CONTRACT,
    chain,
    client,
  });

  return getOwnedNFTs({
    contract,
    owner: account.address,
  }).then((result) => {
    return result.map((nft) => nft.id);
  });
}, []);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const listings = useAsyncState(() => {
  const contract = getContract({
    address: process.env.MARKETPLACE_CONTRACT,
    chain,
    client,
  });

  return totalListings({ contract: contract })
    .then((n) =>
      n
        ? getAllListings({
            contract: contract,
            start: 0,
            count: n,
          })
        : Promise.resolve([])
    )
    .then((listings) =>
      useListingsStore().setAll(
        listings.filter(
          (listing) =>
            listing.assetContractAddress === process.env.NFT_CONTRACT &&
            listing.status === 'ACTIVE'
        )
      )
    );
}, undefined);

function reload() {
  listRequest.execute();
  listings.execute();
}
</script>
