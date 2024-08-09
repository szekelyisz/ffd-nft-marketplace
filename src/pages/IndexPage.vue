<template>
  <q-page responsive class="q-pa-md">
    <div
      class="column content-center items-center"
      v-if="!accountStore.account"
    >
      <q-btn
        label="Connect Wallet"
        rounded
        flat
        @click="walletConnect.execute()"
        icon="wallet"
      />
    </div>

    <NftList v-else />
  </q-page>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';
import NftList from 'src/components/NftList.vue';
import { useAccountStore } from 'src/stores/account';
import { createWallet } from 'thirdweb/wallets';

const accountStore = useAccountStore();

accountStore.wallet = createWallet('io.metamask');

const walletConnect = useAsyncState(
  () =>
    accountStore.wallet !== undefined
      ? accountStore.wallet
          .connect({
            client: accountStore.client,
          })
          .then((account) => (accountStore.account = account))
      : Promise.resolve(undefined),
  undefined,
  { immediate: false }
);
</script>
