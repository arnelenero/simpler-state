import { useEffect } from 'react'
import store from './store'

export const useEntityBoundary = () => {
  useEffect(() => {
    return () => {
      for (let i = 0; i < store.length; i++) {
        store[i]._value = store[i]._initialValue
      }
    }
  }, [])
}

export default useEntityBoundary
