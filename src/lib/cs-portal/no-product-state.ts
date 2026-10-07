export function createNoProductState() {
  return {
    code: 'REGISTER_PRODUCT' as const,
    showFooter: true as const,
    title: { th: 'ยังไม่มีสินค้า', en: 'No products yet' },
    message: {
      th: '',
      en: '',
    },
    action: {
      type: 'internal' as const,
      route: '/register-product' as const,
      label: { th: 'ลงทะเบียนเลย (Register Now)', en: 'Register now' },
    },
  };
}
