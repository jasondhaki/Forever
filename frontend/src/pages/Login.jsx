import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useShop } from '../context/ShopContext'

const input = 'w-full px-3 py-2 border border-gray-800'

export default function Login() {
  const { token, login, api } = useShop()
  const { state } = useLocation()
  const [mode, setMode] = useState('Login')
  const [busy, setBusy] = useState(false)
  const isLogin = mode === 'Login'

  if (token) return <Navigate to={state?.from ?? '/'} replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const body = Object.fromEntries(new FormData(e.target))
      const data = await api(isLogin ? '/user/login' : '/user/register', { body })
      if (!data.success) return toast.error(data.message)
      await login(data.token)
      toast.success(isLogin ? `Welcome back, ${data.name}` : `Welcome, ${data.name}`)
    } catch {
      toast.error('Could not reach the server')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <h1 className="font-prata text-3xl">{mode}</h1>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {!isLogin && <input name="name" className={input} placeholder="Name" autoComplete="name" required />}
      <input name="email" type="email" className={input} placeholder="Email" autoComplete="email" required />
      <input
        name="password"
        type="password"
        className={input}
        placeholder="Password"
        autoComplete={isLogin ? 'current-password' : 'new-password'}
        minLength={8}
        required
      />
      <div className="w-full flex justify-between text-sm -mt-2">
        <button type="button" onClick={() => toast.info('Password reset is not available yet')} className="cursor-pointer">
          Forgot your password?
        </button>
        <button type="button" onClick={() => setMode(isLogin ? 'Sign Up' : 'Login')} className="cursor-pointer">
          {isLogin ? 'Create account' : 'Login Here'}
        </button>
      </div>
      <button type="submit" disabled={busy} className="bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer disabled:opacity-60">
        {busy ? 'Please wait…' : isLogin ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  )
}
