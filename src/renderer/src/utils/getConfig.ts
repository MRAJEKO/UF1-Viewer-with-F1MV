import { Config } from 'npm_f1mv_api'

export const getConfig = () => {
  const configString = localStorage.getItem('config')

  if (!configString) return

  const config: Config = JSON.parse(configString)

  return config
}
