export default function transform(message: any) {
  return {
    ...message,
    context: JSON.stringify(message.context),
  }
}
