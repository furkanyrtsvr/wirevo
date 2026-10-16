# TIM2 down-count and center-aligned acceptance · 0.56

This change extends the existing TIM2 model only. It is not a claim of full STM32 timer coverage.

## Implemented

- CR1.DIR edge down-counting: ARR → 0 → ARR, update at underflow, compare matches and down-count PWM1/PWM2 references.
- CR1.CMS=1/2/3 triangular internal-clock counting, readable hardware direction, update events at the upper and lower endpoints. Output compare interrupt flags are selected for down/up/both directions respectively. Actual output compare actions and ADC compare triggers still occur in both directions.
- Counter/prescaler phase is preserved over CEN/RCC pause and CNT writes. UG clears prescaler phase and reloads CNT from ARR in down-count mode, or zero in center mode.
- PSC/ARR/CCR preload reload at the next update; UDIS/URS and one-pulse stopping retain the existing model semantics. A center-aligned one-pulse stops at its first upper boundary rather than forcing CNT to zero.
- DIR remains read-only in center/encoder mode. CMS changes require CEN=0 in this simulator. Encoder plus CMS is rejected explicitly.

## Evidence

`node --test tests/stm32-timer-alignment.test.mjs tests/stm32-timer-events.test.mjs tests/stm32-timer-phase.test.mjs`

The alignment file contributes 28 tests: F1/F4 register timing, PWM references, preload, pause/UG, output compare action independent of interrupt selection, CCR above ARR and 12 real Clang-compiled ARM firmware cases. The firmware cases run on STM32F103C6, Nucleo F401RE and WeAct F411CE, route genuine TIM2 IRQ28 through the native CPU, and verify compare/update totals plus direction recorded in the C ISR. Existing encoder, compare, capture-plan, one-pulse and phase regressions run alongside them.

## Remaining limits

Only TIM2 is modelled. This does not add TIM1/TIM8 dead time, complementary outputs, break inputs, repetition counters, additional TIM instances, master/slave synchronization, ETR/TRGO, digital input filters, remapping or timer DMA. CMS changes while enabled are deliberately rejected; this is a simulator restriction, even where silicon permits particular transitions. Electrical switching transients and exact cycle-level peripheral/CPU boundary races are outside this model. C helper APIs still expose their existing defaults; advanced counting is configured through TIM2 registers.

## Primary references

- ST [RM0008, general-purpose timers and TIMx_CR1/SR](https://www.st.com/resource/en/reference_manual/rm0008-stm32f103xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf).
- ST [RM0368, STM32F401 reference manual](https://www.st.com/resource/en/reference_manual/DM00096844.pdf).
- ST [RM0383, STM32F411 reference manual](https://www.st.com/resource/en/reference_manual/dm00119316.pdf).

The model uses the documented internal-clock count sequences, update boundaries, DIR/CMS interpretation, and CMS output-compare interrupt selection. Tests are acceptance of this stated simulator subset, not measurements on physical silicon.
