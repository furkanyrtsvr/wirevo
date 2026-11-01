#pragma once
#include <stdint.h>
#define BLE_NPL_OS_ALIGNMENT 4
#define BLE_NPL_TIME_FOREVER 0xffffffffu
typedef uint32_t ble_npl_time_t;typedef int32_t ble_npl_stime_t;
struct ble_npl_event{void(*fn)(struct ble_npl_event*);void*arg;int queued;struct ble_npl_event*next;};
struct ble_npl_eventq{struct ble_npl_event*head,*tail;};
struct ble_npl_callout{struct ble_npl_event ev;struct ble_npl_eventq*q;uint32_t at;int active;struct ble_npl_callout*next;};
struct ble_npl_mutex{unsigned count;};struct ble_npl_sem{unsigned count;};
