/**
 * 注册的监听器
 */
import mitt, { EventType, Handler } from "mitt";

// import { uidFactory } from "@/utils/index";

function uid_factory() {
  let _uid = 0;
  return function uid() {
    _uid += 1;
    return _uid;
  };
}

const uid = uid_factory();

// 这里必须给 Tip 显示声明值，否则默认为 0，会和其他地方声明的 Events 第一个 Key 冲突
enum BaseEvents {
  Loading = "__loading",
  Destroy = "__destroy",
}
type TheTypesOfBaseEvents = {
  [BaseEvents.Destroy]: void;
};
type BaseDomainEvents<E> = TheTypesOfBaseEvents & E;

// const uid = uid_factory();
export function base<Events extends Record<EventType, unknown>>() {
  const emitter = mitt<BaseDomainEvents<Events>>();
  let listeners: (() => void)[] = [];

  return {
    off<Key extends keyof BaseDomainEvents<Events>>(
      event: Key,
      handler: Handler<BaseDomainEvents<Events>[Key]>,
    ) {
      emitter.off(event, handler);
    },
    on<Key extends keyof BaseDomainEvents<Events>>(
      event: Key,
      handler: Handler<BaseDomainEvents<Events>[Key]>,
    ) {
      const unlisten = () => {
        listeners = listeners.filter((l) => l !== unlisten);
        this.off(event, handler);
      };
      listeners.push(unlisten);
      emitter.on(event, handler);
      return unlisten;
    },
    uid,
    emit<Key extends keyof BaseDomainEvents<Events>>(
      event: Key,
      value?: BaseDomainEvents<Events>[Key],
    ) {
      emitter.emit(event, value as any);
    },
    destroy() {
      for (let i = 0; i < listeners.length; i += 1) {
        const off = listeners[i];
        off();
      }
      this.emit(BaseEvents.Destroy, null as any);
    },
  };
}

export type { Handler };
