// @ts-nocheck
import classNames from 'classnames'
import { motion } from 'framer-motion'
import Spinner from './Spinner'

type ButtonProps = {
    children: React.ReactNode
    loading?: boolean
    animateScale?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
    children,
    className,
    disabled,
    loading,
    animateScale = false,
    ...props
}: ButtonProps) {
    const buttonVariants = {
        press: { scale: animateScale ? 0.95 : 1 },
        rest: { scale: 1 },
    }

    return (
        <motion.button
            variants={buttonVariants}
            initial="rest"
            whileTap="press"
            whileHover="rest"
            disabled={disabled || loading}
            className={classNames(
                'hover:bg-opacity-90 outline-none transition-short font-semibold text-white py-4 px-6 bg-black',
                'min-w-24 rounded-full',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                className
            )}
            {...props}
        >
            {loading ? <Spinner /> : children}
        </motion.button>
    )
}
