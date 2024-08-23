<template>
  <q-card
    class="nft-card q-ma-sm"
    v-if="metadataRequest.isFinished.value && !metadataRequest.error.value"
  >
    <q-card-section class="items-center">
      <div>
        <div class="row items-center">
          <div class="col">
            <div class="row">
              <div
                v-if="
                  metadataRequest.data.value?.content.instance.category ===
                  'food'
                "
                class="text-subtitle1"
              >
                <q-icon name="restaurant" size="24px" class="q-mr-sm" />
                {{ metadataRequest.data.value?.content.instance.type }}
              </div>
              <div
                v-if="
                  metadataRequest.data.value?.content.instance.category ===
                  'cartridge'
                "
              >
                <q-icon name="dns" size="24px" class="q-mr-sm" />
                {{ metadataRequest.data.value?.content.instance.grade }}
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
          <div v-if="account !== undefined">
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
import { useMarketApi } from 'src/boot/axios';
import { NftMetadata } from './models';
import { useAccountStore } from 'src/stores/account';
import { copyToClipboard } from 'quasar';
import { useQuasar } from 'quasar';
import CreateListingDialog from './CreateListingDialog.vue';
import CancelListingDialog from './CancelListingDialog.vue';
import { computed } from 'vue';
import { useListingsStore } from 'src/stores/listings';

const props = defineProps<{ tokenId: bigint }>();

const { account } = useAccountStore();

const $q = useQuasar();

const metadataRequest = useMarketApi<NftMetadata>(`/metadata/${props.tokenId}`)
  .get()
  .json<NftMetadata>();

function createListing() {
  $q.dialog({
    component: CreateListingDialog,
    componentProps: {
      tokenId: props.tokenId,
      metadata: metadataRequest.data.value?.content,
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
    (listing) => listing.tokenId === props.tokenId
  )
);
</script>

<style lang="sass" scoped>
.nft-card
  width: 100%
  max-width: 300px
</style>
