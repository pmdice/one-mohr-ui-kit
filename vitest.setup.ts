import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
    cleanup()
})
// Animations are not under test; finish them instantly so exits unmount synchronously.
import { MotionGlobalConfig } from 'framer-motion'
MotionGlobalConfig.skipAnimations = true
