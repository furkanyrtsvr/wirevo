#pragma once
void wirevo_assert(const char*,int);
#define assert(x) ((x)?(void)0:wirevo_assert(__FILE__,__LINE__))

#define static_assert _Static_assert
