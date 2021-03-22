import { ConfirmedBlock, Connection } from "@solana/web3.js";

import * as Rx from "rxjs";

const BLOCK_FETCH_TIMEOUT = 5000;

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ConfirmedBlockSubscription {
  private static subject = new Rx.ReplaySubject<ConfirmedBlock>(1);

  private static connection = new Connection(
    process.env.API_ENDPOINT || "http://localhost:8899"
  );

  private static id: number | undefined;

  static getObservable() {
    return this.subject.asObservable();
  }

  static async start() {
    this.id = this.connection.onSlotChange(async (slotInfo) => {
      await timeout(BLOCK_FETCH_TIMEOUT);
      try {
        const block = await this.connection.getConfirmedBlock(slotInfo.root);
        console.log(`Fetched block at slot: ${slotInfo.root}`);
        this.subject.next(block);
      } catch (error) {
        console.log(error);
      }
    });
  }

  static async stop() {
    if (this.id) {
      this.connection.removeSlotChangeListener(this.id);
    }
  }
}
