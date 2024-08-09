<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Fair Food Data Marketplace</q-toolbar-title>
        <div v-if="accountStore.account !== undefined">
          <q-btn-dropdown flat rounded>
            <template v-slot:label>
              <span
                style="
                  max-width: 12em;
                  text-overflow: ellipsis;
                  overflow: hidden;
                "
              >
                {{ accountStore.account.address }}
              </span>
            </template>
            <div class="q-pa-md column">
              <div class="row col items-center q-mb-md">
                <q-input
                  :model-value="accountStore.account.address"
                  readonly
                  dense
                />
                <q-btn
                  round
                  flat
                  size="10px"
                  icon="content_copy"
                  @click="
                    accountStore.account?.address &&
                      copyToClipboard(accountStore.account.address)
                  "
                  class="q-ml-sm"
                />
              </div>
              <q-btn
                label="Disconnect Wallet"
                flat
                rounded
                @click="walletDisconnect.execute()"
                v-close-popup
              />
            </div>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';
import { useAccountStore } from 'src/stores/account';
import { copyToClipboard } from 'quasar';

defineOptions({
  name: 'MainLayout',
});

const accountStore = useAccountStore();

const walletDisconnect = useAsyncState(
  () => {
    return (
      accountStore.wallet
        ?.disconnect()
        .then(() => (accountStore.account = undefined)) || Promise.resolve()
    );
  },
  undefined,
  { immediate: false }
);
</script>
