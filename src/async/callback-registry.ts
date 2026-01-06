/**
 * Callback registry - converts C callbacks to JavaScript Promises
 */

import { JSCallback, ptr } from "bun:ffi";
import { memory, type Pointer } from "../ffi";
import { StructEncoder } from "../structs/encoder";
import {
  WGPURequestAdapterCallbackInfo,
  WGPURequestDeviceCallbackInfo,
  WGPUBufferMapCallbackInfo,
  WGPUQueueWorkDoneCallbackInfo,
  WGPUPopErrorScopeCallbackInfo,
  WGPUCreateComputePipelineAsyncCallbackInfo,
  WGPUCreateRenderPipelineAsyncCallbackInfo,
  WGPUCompilationInfoCallbackInfo,
} from "../structs/definitions/callbacks";
import {
  WGPUCallbackMode,
  WGPURequestAdapterStatus,
  WGPURequestDeviceStatus,
  WGPUBufferMapAsyncStatus,
  WGPUErrorType,
  WGPUPopErrorScopeStatus,
  WGPUCreatePipelineAsyncStatus,
  WGPUCompilationInfoRequestStatus,
  WGPUCompilationMessageType,
} from "../ffi/types";

interface PendingCallback<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  jsCallback: JSCallback;
}

/**
 * Manages callback registration and Promise resolution
 */
export class CallbackRegistry {
  private pending = new Map<number, PendingCallback<unknown>>();
  private nextId = 1;

  /**
   * Create a callback for adapter request
   * Returns the encoded callback info struct pointer and a promise
   */
  createAdapterCallback(encoder: StructEncoder): {
    callbackInfoPtr: Pointer;
    promise: Promise<Pointer>;
  } {
    const id = this.nextId++;

    const jsCallback = new JSCallback(
      (
        status: number,
        adapter: Pointer,
        messageData: Pointer,
        messageLength: number,
        userdata1: Pointer,
        _userdata2: Pointer
      ) => {
        const pendingId = Number(userdata1);
        const pending = this.pending.get(pendingId);
        if (!pending) return;

        this.pending.delete(pendingId);

        if (status === WGPURequestAdapterStatus.Success) {
          pending.resolve(adapter);
        } else {
          const message = messageLength > 0 ? memory.readString(messageData, messageLength) : "Unknown error";
          pending.reject(new Error(`Failed to request adapter (status ${status}): ${message}`));
        }

        // Clean up the callback after use
        setTimeout(() => pending.jsCallback.close(), 0);
      },
      {
        args: ["u32", "ptr", "ptr", "usize", "ptr", "ptr"],
        returns: "void",
      }
    );

    const promise = new Promise<Pointer>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, jsCallback } as PendingCallback<unknown>);
    });

    const callbackInfoPtr = encoder.encode(WGPURequestAdapterCallbackInfo, {
      nextInChain: 0,
      mode: WGPUCallbackMode.AllowProcessEvents,
      callback: jsCallback.ptr,
      userdata1: id,
      userdata2: 0,
    }).ptr;

    return { callbackInfoPtr, promise };
  }

  /**
   * Create a callback for device request
   */
  createDeviceCallback(encoder: StructEncoder): {
    callbackInfoPtr: Pointer;
    promise: Promise<Pointer>;
  } {
    const id = this.nextId++;

    const jsCallback = new JSCallback(
      (
        status: number,
        device: Pointer,
        messageData: Pointer,
        messageLength: number,
        userdata1: Pointer,
        _userdata2: Pointer
      ) => {
        const pendingId = Number(userdata1);
        const pending = this.pending.get(pendingId);
        if (!pending) return;

        this.pending.delete(pendingId);

        if (status === WGPURequestDeviceStatus.Success) {
          pending.resolve(device);
        } else {
          const message = messageLength > 0 ? memory.readString(messageData, messageLength) : "Unknown error";
          pending.reject(new Error(`Failed to request device (status ${status}): ${message}`));
        }

        setTimeout(() => pending.jsCallback.close(), 0);
      },
      {
        args: ["u32", "ptr", "ptr", "usize", "ptr", "ptr"],
        returns: "void",
      }
    );

    const promise = new Promise<Pointer>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, jsCallback } as PendingCallback<unknown>);
    });

    const callbackInfoPtr = encoder.encode(WGPURequestDeviceCallbackInfo, {
      nextInChain: 0,
      mode: WGPUCallbackMode.AllowProcessEvents,
      callback: jsCallback.ptr,
      userdata1: id,
      userdata2: 0,
    }).ptr;

    return { callbackInfoPtr, promise };
  }

  /**
   * Create a callback for buffer map
   */
  createBufferMapCallback(encoder: StructEncoder): {
    callbackInfoPtr: Pointer;
    promise: Promise<void>;
  } {
    const id = this.nextId++;

    const jsCallback = new JSCallback(
      (
        status: number,
        messageData: Pointer,
        messageLength: number,
        userdata1: Pointer,
        _userdata2: Pointer
      ) => {
        const pendingId = Number(userdata1);
        const pending = this.pending.get(pendingId);
        if (!pending) return;

        this.pending.delete(pendingId);

        if (status === WGPUBufferMapAsyncStatus.Success) {
          pending.resolve(undefined);
        } else {
          const message = messageLength > 0 ? memory.readString(messageData, messageLength) : "Unknown error";
          pending.reject(new Error(`Failed to map buffer (status ${status}): ${message}`));
        }

        setTimeout(() => pending.jsCallback.close(), 0);
      },
      {
        args: ["u32", "ptr", "usize", "ptr", "ptr"],
        returns: "void",
      }
    );

    const promise = new Promise<void>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, jsCallback } as PendingCallback<unknown>);
    });

    const callbackInfoPtr = encoder.encode(WGPUBufferMapCallbackInfo, {
      nextInChain: 0,
      mode: WGPUCallbackMode.AllowProcessEvents,
      callback: jsCallback.ptr,
      userdata1: id,
      userdata2: 0,
    }).ptr;

    return { callbackInfoPtr, promise };
  }

  /**
   * Create a callback for queue work done
   */
  createQueueWorkDoneCallback(encoder: StructEncoder): {
    callbackInfoPtr: Pointer;
    promise: Promise<void>;
  } {
    const id = this.nextId++;

    const jsCallback = new JSCallback(
      (status: number, userdata1: Pointer, _userdata2: Pointer) => {
        const pendingId = Number(userdata1);
        const pending = this.pending.get(pendingId);
        if (!pending) return;

        this.pending.delete(pendingId);

        // WGPUQueueWorkDoneStatus_Success = 1
        if (status === 1) {
          pending.resolve(undefined);
        } else {
          pending.reject(new Error(`Queue work done failed (status ${status})`));
        }

        setTimeout(() => pending.jsCallback.close(), 0);
      },
      {
        args: ["u32", "ptr", "ptr"],
        returns: "void",
      }
    );

    const promise = new Promise<void>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, jsCallback } as PendingCallback<unknown>);
    });

    const callbackInfoPtr = encoder.encode(WGPUQueueWorkDoneCallbackInfo, {
      nextInChain: 0,
      mode: WGPUCallbackMode.AllowProcessEvents,
      callback: jsCallback.ptr,
      userdata1: id,
      userdata2: 0,
    }).ptr;

    return { callbackInfoPtr, promise };
  }

  /**
   * Error result type for popErrorScope
   */
  private createGPUError(type: number, message: string): GPUError | null {
    if (type === WGPUErrorType.NoError) {
      return null;
    }

    const errorMessage = message || "Unknown GPU error";

    if (type === WGPUErrorType.Validation) {
      return new GPUValidationError(errorMessage);
    } else if (type === WGPUErrorType.OutOfMemory) {
      return new GPUOutOfMemoryError(errorMessage);
    } else if (type === WGPUErrorType.Internal) {
      return new GPUInternalError(errorMessage);
    }

    return new GPUValidationError(errorMessage);
  }

  /**
   * Create a callback for popErrorScope
   */
  createPopErrorScopeCallback(encoder: StructEncoder): {
    callbackInfoPtr: Pointer;
    promise: Promise<GPUError | null>;
  } {
    const id = this.nextId++;

    const jsCallback = new JSCallback(
      (
        status: number,
        errorType: number,
        messageData: Pointer,
        messageLength: number,
        userdata1: Pointer,
        _userdata2: Pointer
      ) => {
        const pendingId = Number(userdata1);
        const pending = this.pending.get(pendingId);
        if (!pending) return;

        this.pending.delete(pendingId);

        if (status === WGPUPopErrorScopeStatus.Success) {
          const message = messageLength > 0 ? memory.readString(messageData, messageLength) : "";
          const error = this.createGPUError(errorType, message);
          pending.resolve(error);
        } else if (status === WGPUPopErrorScopeStatus.EmptyStack) {
          pending.reject(new Error("Error scope stack is empty"));
        } else {
          pending.reject(new Error(`Failed to pop error scope (status ${status})`));
        }

        setTimeout(() => pending.jsCallback.close(), 0);
      },
      {
        args: ["u32", "u32", "ptr", "usize", "ptr", "ptr"],
        returns: "void",
      }
    );

    const promise = new Promise<GPUError | null>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, jsCallback } as PendingCallback<unknown>);
    });

    const callbackInfoPtr = encoder.encode(WGPUPopErrorScopeCallbackInfo, {
      nextInChain: 0,
      mode: WGPUCallbackMode.AllowProcessEvents,
      callback: jsCallback.ptr,
      userdata1: id,
      userdata2: 0,
    }).ptr;

    return { callbackInfoPtr, promise };
  }

  /**
   * Create a callback for createComputePipelineAsync
   */
  createComputePipelineAsyncCallback(encoder: StructEncoder): {
    callbackInfoPtr: Pointer;
    promise: Promise<Pointer>;
  } {
    const id = this.nextId++;

    const jsCallback = new JSCallback(
      (
        status: number,
        pipeline: Pointer,
        messageData: Pointer,
        messageLength: number,
        userdata1: Pointer,
        _userdata2: Pointer
      ) => {
        const pendingId = Number(userdata1);
        const pending = this.pending.get(pendingId);
        if (!pending) return;

        this.pending.delete(pendingId);

        if (status === WGPUCreatePipelineAsyncStatus.Success) {
          pending.resolve(pipeline);
        } else {
          const message = messageLength > 0 ? memory.readString(messageData, messageLength) : "Unknown error";
          pending.reject(new Error(`Failed to create compute pipeline (status ${status}): ${message}`));
        }

        setTimeout(() => pending.jsCallback.close(), 0);
      },
      {
        args: ["u32", "ptr", "ptr", "usize", "ptr", "ptr"],
        returns: "void",
      }
    );

    const promise = new Promise<Pointer>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, jsCallback } as PendingCallback<unknown>);
    });

    const callbackInfoPtr = encoder.encode(WGPUCreateComputePipelineAsyncCallbackInfo, {
      nextInChain: 0,
      mode: WGPUCallbackMode.AllowProcessEvents,
      callback: jsCallback.ptr,
      userdata1: id,
      userdata2: 0,
    }).ptr;

    return { callbackInfoPtr, promise };
  }

  /**
   * Create a callback for createRenderPipelineAsync
   */
  createRenderPipelineAsyncCallback(encoder: StructEncoder): {
    callbackInfoPtr: Pointer;
    promise: Promise<Pointer>;
  } {
    const id = this.nextId++;

    const jsCallback = new JSCallback(
      (
        status: number,
        pipeline: Pointer,
        messageData: Pointer,
        messageLength: number,
        userdata1: Pointer,
        _userdata2: Pointer
      ) => {
        const pendingId = Number(userdata1);
        const pending = this.pending.get(pendingId);
        if (!pending) return;

        this.pending.delete(pendingId);

        if (status === WGPUCreatePipelineAsyncStatus.Success) {
          pending.resolve(pipeline);
        } else {
          const message = messageLength > 0 ? memory.readString(messageData, messageLength) : "Unknown error";
          pending.reject(new Error(`Failed to create render pipeline (status ${status}): ${message}`));
        }

        setTimeout(() => pending.jsCallback.close(), 0);
      },
      {
        args: ["u32", "ptr", "ptr", "usize", "ptr", "ptr"],
        returns: "void",
      }
    );

    const promise = new Promise<Pointer>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, jsCallback } as PendingCallback<unknown>);
    });

    const callbackInfoPtr = encoder.encode(WGPUCreateRenderPipelineAsyncCallbackInfo, {
      nextInChain: 0,
      mode: WGPUCallbackMode.AllowProcessEvents,
      callback: jsCallback.ptr,
      userdata1: id,
      userdata2: 0,
    }).ptr;

    return { callbackInfoPtr, promise };
  }

  /**
   * Create a callback for getCompilationInfo
   */
  createCompilationInfoCallback(encoder: StructEncoder): {
    callbackInfoPtr: Pointer;
    promise: Promise<GPUCompilationInfo>;
  } {
    const id = this.nextId++;

    const jsCallback = new JSCallback(
      (
        status: number,
        compilationInfo: Pointer,
        userdata1: Pointer,
        _userdata2: Pointer
      ) => {
        const pendingId = Number(userdata1);
        const pending = this.pending.get(pendingId);
        if (!pending) return;

        this.pending.delete(pendingId);

        if (status === WGPUCompilationInfoRequestStatus.Success && compilationInfo) {
          // Parse the WGPUCompilationInfo struct
          const messages = this.parseCompilationInfo(compilationInfo);
          const result: GPUCompilationInfo = {
            __brand: "GPUCompilationInfo",
            messages,
          };
          pending.resolve(result);
        } else {
          // Return empty compilation info on error
          const result: GPUCompilationInfo = {
            __brand: "GPUCompilationInfo",
            messages: [],
          };
          pending.resolve(result);
        }

        setTimeout(() => pending.jsCallback.close(), 0);
      },
      {
        args: ["u32", "ptr", "ptr", "ptr"],
        returns: "void",
      }
    );

    const promise = new Promise<GPUCompilationInfo>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, jsCallback } as PendingCallback<unknown>);
    });

    const callbackInfoPtr = encoder.encode(WGPUCompilationInfoCallbackInfo, {
      nextInChain: 0,
      mode: WGPUCallbackMode.AllowProcessEvents,
      callback: jsCallback.ptr,
      userdata1: id,
      userdata2: 0,
    }).ptr;

    return { callbackInfoPtr, promise };
  }

  /**
   * Parse WGPUCompilationInfo struct into GPUCompilationMessage array
   */
  private parseCompilationInfo(infoPtr: Pointer): GPUCompilationMessage[] {
    const messages: GPUCompilationMessage[] = [];

    // WGPUCompilationInfo structure:
    // offset 0: nextInChain (ptr, 8)
    // offset 8: messageCount (usize, 8)
    // offset 16: messages (ptr to array, 8)

    const infoView = new DataView(
      new Uint8Array(memory.read(infoPtr, 24)).buffer
    );
    const messageCount = Number(infoView.getBigUint64(8, true));
    const messagesPtr = Number(infoView.getBigUint64(16, true)) as unknown as Pointer;

    if (messageCount === 0 || !messagesPtr) {
      return messages;
    }

    // WGPUCompilationMessage structure (approx 72 bytes):
    // offset 0: nextInChain (ptr, 8)
    // offset 8: message.data (ptr, 8)
    // offset 16: message.length (usize, 8)
    // offset 24: type (u32, 4)
    // offset 28: padding (4)
    // offset 32: lineNum (u64, 8)
    // offset 40: linePos (u64, 8)
    // offset 48: offset (u64, 8)
    // offset 56: length (u64, 8)
    // offset 64: utf16LinePos (u64, 8)
    // offset 72: utf16Offset (u64, 8)
    // offset 80: utf16Length (u64, 8)
    const MESSAGE_SIZE = 88;

    for (let i = 0; i < messageCount; i++) {
      const msgPtr = (Number(messagesPtr) + i * MESSAGE_SIZE) as unknown as Pointer;
      const msgData = memory.read(msgPtr, MESSAGE_SIZE);
      const msgView = new DataView(new Uint8Array(msgData).buffer);

      const messageDataPtr = Number(msgView.getBigUint64(8, true)) as unknown as Pointer;
      const messageLength = Number(msgView.getBigUint64(16, true));
      const messageType = msgView.getUint32(24, true);
      const lineNum = Number(msgView.getBigUint64(32, true));
      const linePos = Number(msgView.getBigUint64(40, true));

      let type: GPUCompilationMessageType = "info";
      if (messageType === WGPUCompilationMessageType.Error) {
        type = "error";
      } else if (messageType === WGPUCompilationMessageType.Warning) {
        type = "warning";
      }

      const messageText = messageLength > 0
        ? memory.readString(messageDataPtr, messageLength)
        : "";

      messages.push({
        message: messageText,
        type,
        lineNum,
        linePos,
        offset: Number(msgView.getBigUint64(48, true)),
        length: Number(msgView.getBigUint64(56, true)),
      } as GPUCompilationMessage);
    }

    return messages;
  }

  /**
   * Check if there are pending callbacks
   */
  hasPending(): boolean {
    return this.pending.size > 0;
  }

  /**
   * Get count of pending callbacks
   */
  pendingCount(): number {
    return this.pending.size;
  }

  /**
   * Clean up all pending callbacks (for shutdown)
   */
  cleanup(): void {
    for (const [, pending] of this.pending) {
      pending.reject(new Error("Callback registry cleaned up"));
      pending.jsCallback.close();
    }
    this.pending.clear();
  }
}

// Global callback registry singleton
let globalRegistry: CallbackRegistry | null = null;

export function getCallbackRegistry(): CallbackRegistry {
  if (!globalRegistry) {
    globalRegistry = new CallbackRegistry();
  }
  return globalRegistry;
}
