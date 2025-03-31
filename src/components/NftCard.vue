<template>
  <q-card
    class="nft-card q-ma-sm"
    v-if="metadataRequest.isReady.value && !metadataRequest.error.value"
  >
    <q-card-section class="items-center">
      <div>
        <div class="row items-center">
          <div class="col">
            <div class="row">
              <div
                v-if="metadataRequest.state.value?.instance.category === 'food'"
                class="text-subtitle1"
              >
                <q-icon name="restaurant" size="24px" class="q-mr-sm" />
                {{ metadataRequest.state.value?.instance.type }}
              </div>
              <div
                v-if="
                  metadataRequest.state.value?.instance.category === 'cartridge'
                "
              >
                <q-icon name="dns" size="24px" class="q-mr-sm" />
                {{ metadataRequest.state.value?.instance.grade }}
              </div>
              <q-btn
                round
                flat
                size="10px"
                icon="content_copy"
                @click="copyToClipboard($props.tokenId.toString())"
                class="q-mx-xs"
              />
              <a
                :href="`https://package.trace.market/?p=${$props.tokenId}`"
                target="_blank"
                class="q-ma-xs"
              >
                <q-icon name="open_in_new" size="16px" />
              </a>
            </div>
          </div>
          <div v-if="accountStore.account !== undefined">
            <q-btn
              v-if="listing !== undefined"
              fab-mini
              @click="cancelListing"
              icon="close"
              dense
            />
            <q-btn v-else fab-mini @click="createListing" icon="sell" dense />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useAccountStore } from 'src/stores/account';
import { copyToClipboard } from 'quasar';
import { useQuasar } from 'quasar';
import CreateListingDialog from './CreateListingDialog.vue';
import CancelListingDialog from './CancelListingDialog.vue';
import { computed } from 'vue';
import { useListingsStore } from 'src/stores/listings';
import assert from 'assert';
import { getContract, readContract } from 'thirdweb';
import { Pokedex, TokenId } from '@fairfooddata/types';
import { useAsyncState } from '@vueuse/core';

const props = defineProps<{ tokenId: TokenId }>();

const accountStore = useAccountStore();

const $q = useQuasar();

const nftContract = getContract({
  client: accountStore.client,
  chain: accountStore.chain,
  address: process.env.NFT_CONTRACT as string,
});

async function getTokenMetadata<T>(tokenId: TokenId): Promise<T> {
  assert(accountStore.account !== undefined);

  return readContract({
    contract: nftContract,
    method: 'function metadata(uint256 tokenId) public view returns (uint256)',
    params: [BigInt(tokenId)],
  })
    .then((swarmHash) =>
      fetch(process.env.SWARM_API_URL + `/bzz/${swarmHash.toString(16)}/`)
    )
    .then((response) => response.json());
}

const metadataRequest = useAsyncState<Pokedex | undefined>(
  getTokenMetadata<Pokedex>(props.tokenId),
  undefined
);

function createListing() {
  $q.dialog({
    component: CreateListingDialog,
    componentProps: {
      tokenId: props.tokenId,
      metadata: metadataRequest.state.value,
    },
  });
}

function cancelListing() {
  $q.dialog({
    component: CancelListingDialog,
    componentProps: {
      tokenId: props.tokenId,
      listingId: listing.value?.id,
    },
  });
}

const listing = computed(() =>
  useListingsStore().listings.find(
    (listing) => listing.tokenId === BigInt(props.tokenId)
  )
);
</script>

<style lang="sass" scoped>
.nft-card
  width: 100%
  max-width: 300px
</style>
