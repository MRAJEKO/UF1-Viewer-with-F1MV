import styles from './Loader.module.scss'

interface ILoaderProps {
  color: string
  backroundColor?: string
}

const Loader = ({ color = 'transparent' }: ILoaderProps) => {
  return (
    <div
      className={styles.loader}
      style={{ border: '4px solid transparent', borderTop: `4px solid ${color}` }}
    ></div>
  )
}
export default Loader
