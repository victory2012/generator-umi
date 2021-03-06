import { message } from 'antd'
import { createModel } from 'hox'
import { useState, useEffect, useCallback } from 'react'
import { formatMessage } from 'umi-plugin-react/locale'

import API from '@/helpers/api'
import { getToken, setToken, clearAll } from '@/helpers/storage'
import { redirectTo } from '@/helpers/view'

function useAuthModel() {
  const [tokenState, setTokenState] = useState(getToken())
  const [currentUser, setCurrentUser] = useState(null)

  // fetch current user whenver tokenState changed
  useEffect(() => {
    if (tokenState) {
      API.get('/user').then(res => {
        setCurrentUser(res.data)
      })
    }
  }, [tokenState])

  // redirect to login page whenver tokenState changed && is empty
  useEffect(() => {
    if (!tokenState) {
      redirectTo('/o/login')
    }
  }, [tokenState])

  const sign = useCallback((account, password) => {
    return API.post('/login', {
      data: {
        account,
        password
      }
    }).then(data => {
      if (data.errorCode === 200) {
        setToken(data.data.token)
        setTokenState(data.data.token)
        redirectTo('/')
      } else {
        message.warning(formatMessage({ id: 'LOGIN_ACCOUNT_PASSWORD_ERROR' }))
      }
      return data
    })
  }, [])

  const signout = useCallback((account, password) => {
    clearAll()
    setCurrentUser(null)
    setTokenState(null)
  }, [])

  return {
    currentUser,
    sign,
    signout
  }
}

export default createModel(useAuthModel)
