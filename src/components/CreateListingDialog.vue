<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin q-pa-sm">
      <q-card-section class="row no-wrap items-center">
        <q-spinner
          v-if="approveTx.isLoading.value"
          color="primary"
          size="3em"
        />
        <q-icon
          size="3em"
          name="done"
          color="green"
          v-else-if="approveTx.isReady.value"
        />
        <q-icon
          size="3em"
          name="error_outline"
          color="red"
          v-else-if="approveTx.error.value"
        />
        <div class="q-pl-sm">Approving transfer of NFT by Marketplace</div>
        <q-btn
          :disable="
            approveTx.state.value === undefined &&
            approveTx.error.value === undefined
          "
          round
          flat
          size="10px"
          icon="content_copy"
          @click="
            copyToClipboard(approveTx.state.value! || approveTx.error.value!)
          "
          class="q-mx-xs"
        >
          <q-tooltip
            v-if="
              approveTx.isReady.value && approveTx.state.value !== undefined
            "
            >{{ approveTx.state.value }}</q-tooltip
          >
          <q-tooltip v-if="approveTx.error.value"
            >Transaction failed: {{ approveTx.error.value }}</q-tooltip
          >
        </q-btn>
      </q-card-section>

      <q-card-section class="row no-wrap items-center">
        <q-spinner
          v-if="createListingTx.isLoading.value"
          color="primary"
          size="3em"
        />
        <q-icon
          size="3em"
          name="done"
          color="green"
          v-else-if="createListingTx.isReady.value"
        />
        <q-icon
          size="3em"
          name="error_outline"
          color="red"
          v-else-if="createListingTx.error.value"
        />
        <q-icon
          v-else-if="approveTx.error.value"
          size="3em"
          name="close"
          color="grey"
        />
        <q-icon v-else size="3em" />
        <div class="q-pl-sm">Creating listing on Marketplace</div>
        <q-btn
          :disable="
            createListingTx.state.value === undefined &&
            createListingTx.error.value === undefined
          "
          round
          flat
          size="10px"
          icon="content_copy"
          @click="
            copyToClipboard(
              createListingTx.state.value! || createListingTx.error.value!
            )
          "
          class="q-mx-xs"
        >
          <q-tooltip
            v-if="
              createListingTx.isReady.value &&
              createListingTx.state.value !== undefined
            "
            >{{ createListingTx.state.value }}</q-tooltip
          >
          <q-tooltip
            v-if="
              createListingTx.isReady.value &&
              createListingTx.state.value !== undefined
            "
            >{{ createListingTx.state.value }}</q-tooltip
          >
          <q-tooltip v-if="createListingTx.error.value"
            >Transaction failed: {{ createListingTx.error.value }}</q-tooltip
          >
        </q-btn>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Close" @click="onDialogHide" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import assert from 'assert';
import { useDialogPluginComponent, copyToClipboard } from 'quasar';
import { useAccountStore } from 'src/stores/account';
import {
  getContract,
  Hex,
  sendAndConfirmTransaction,
  sendTransaction,
} from 'thirdweb';
import { Pokedex } from '@fairfooddata/types';
import { useAsyncState } from '@vueuse/core';
import { approve } from 'thirdweb/extensions/erc721';
import { createListing } from 'thirdweb/extensions/marketplace';

const accountStore = useAccountStore();

const props = defineProps<{ tokenId: bigint; metadata: Pokedex }>();

defineEmits(useDialogPluginComponent.emits);

const { dialogRef, onDialogHide } = useDialogPluginComponent();

const marketplaceContract = getContract({
  client: accountStore.client,
  chain: accountStore.chain,
  address: process.env.MARKETPLACE_CONTRACT as string,
});

const nftContract = getContract({
  client: accountStore.client,
  chain: accountStore.chain,
  address: process.env.NFT_CONTRACT as string,
});

const createListingTx = useAsyncState<Hex | undefined>(
  async () => {
    assert(props.metadata.instance.price !== undefined, 'NFT has no price');
    assert('expiryDate' in props.metadata.instance, 'NFT has no expiryDate');

    const transaction = createListing({
      contract: marketplaceContract,
      assetContractAddress: nftContract.address,
      tokenId: props.tokenId,
      quantity: 1n,
      currencyContractAddress: props.metadata.instance.price.currency,
      pricePerTokenWei: props.metadata.instance.price.amount.toString(),
      endTimestamp: new Date(
        props.metadata.instance.expiryDate
          ? props.metadata.instance.expiryDate * 1000
          : -1
      ),
      isReservedListing: false,
    });

    assert(accountStore.account !== undefined);
    assert(accountStore.wallet !== undefined);

    if (accountStore.wallet.getChain()?.id !== accountStore.chain.id)
      await accountStore.wallet.switchChain(accountStore.chain);

    return sendTransaction({
      transaction: transaction,
      account: accountStore.account,
    })
      .catch((error) => {
        console.error(error);
        return Promise.reject(error);
      })
      .then(({ transactionHash }) => Promise.resolve(transactionHash));
  },
  undefined,
  { immediate: false }
);

const approveTx = useAsyncState<Hex | undefined>(async () => {
  const transaction = approve({
    contract: nftContract,
    tokenId: props.tokenId,
    to: marketplaceContract.address,
  });

  assert(accountStore.account !== undefined);
  assert(accountStore.wallet !== undefined);

  if (accountStore.wallet.getChain()?.id !== accountStore.chain.id)
    await accountStore.wallet.switchChain(accountStore.chain);

  return sendAndConfirmTransaction({
    transaction: transaction,
    account: accountStore.account,
  })
    .catch((error) => Promise.reject(error))
    .then(({ transactionHash }) => {
      createListingTx.execute();
      return Promise.resolve(transactionHash);
    });
}, undefined);
</script>
