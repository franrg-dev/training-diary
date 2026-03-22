import { createContext, useContext } from 'react'

export const NavResetContext = createContext({ resetSeccion: () => {} })

export function useNavReset() {
  return useContext(NavResetContext)
}
