// CQ-010 FIX: This file is a duplicate of shared/hooks/use-mobile.ts.
// The shared version uses MediaQueryList (more performant, no resize listener).
// Re-export from shared to avoid breaking existing imports while keeping one implementation.
export { useIsMobile } from '@/shared/hooks/use-mobile'
