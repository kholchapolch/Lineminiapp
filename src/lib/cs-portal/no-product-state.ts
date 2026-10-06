export function createNoProductState() {
  return {
    code: 'REGISTER_PRODUCT' as const,
    showFooter: true as const,
    title: { th: 'ยังไม่มีสินค้าที่ลงทะเบียน', en: 'No registered products yet' },
    message: {
      th: 'ลงทะเบียนผลิตภัณฑ์ Sony ของคุณเพื่อดูข้อมูลสินค้าและสิทธิประโยชน์',
      en: 'Register your Sony products to view product information and benefits.',
    },
    action: {
      type: 'internal' as const,
      route: '/register-product' as const,
      label: { th: 'ลงทะเบียนสินค้า', en: 'Register product' },
    },
  };
}
