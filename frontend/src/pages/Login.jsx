import { useState } from 'react'
import { toast } from 'react-toastify'

const input = 'w-full px-3 py-2 border border-gray-800'

export default function Login() {
  const [mode, setMode] = useState('Login')
  const isLogin = mode === 'Login'

  const onSubmit = (e) => {
    e.preventDefault()
    // ponytail: auth lands with the Express/MongoDB backend
    toast.info(`${mode} will be connected once the backend is ready.`)
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
        <button type="button" className="cursor-pointer">Forgot your password?</button>
        <button type="button" onClick={() => setMode(isLogin ? 'Sign Up' : 'Login')} className="cursor-pointer">
          {isLogin ? 'Create account' : 'Login Here'}
        </button>
      </div>
      <button type="submit" className="bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer">
        {isLogin ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  )
}
