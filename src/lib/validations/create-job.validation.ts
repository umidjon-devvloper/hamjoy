import type { CreateJobFormData, CreateJobFormErrors, CreateJobStep } from '@/types';

function parseSalary(value: string): number | null {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function validateCreateJobStep(
  step: CreateJobStep,
  data: CreateJobFormData
): CreateJobFormErrors {
  const errors: CreateJobFormErrors = {};

  if (step === 1) {
    if (!data.title.trim()) errors.title = 'Lavozim nomini kiriting';
    else if (data.title.trim().length < 3) errors.title = 'Lavozim nomi kamida 3 ta belgidan iborat bo\'lsin';

    if (!data.categoryId) errors.categoryId = 'Kategoriyani tanlang';
    if (!data.workType) errors.workType = 'Ish turini tanlang';
    if (!data.scheduleType) errors.scheduleType = 'Ish jadvalini tanlang';
  }

  if (step === 2) {
    const min = parseSalary(data.salaryMin);
    const max = parseSalary(data.salaryMax);

    if (min === null) errors.salaryMin = 'Maosh miqdorini to\'g\'ri kiriting';
    if (max === null) errors.salaryMax = 'Maosh miqdorini to\'g\'ri kiriting';
    if (min !== null && max !== null && min > max) {
      errors.salaryMax = 'Eng yuqori maosh eng past maoshdan katta bo\'lsin';
    }

    if (!data.description.trim()) errors.description = 'Ish tavsifini yozing';
    else if (data.description.trim().length < 20) {
      errors.description = 'Tavsif kamida 20 ta belgidan iborat bo\'lsin';
    }

    if (!data.responsibilities.trim()) errors.responsibilities = 'Kamida bitta majburiyat yozing';
    else if (parseLines(data.responsibilities).length < 1) {
      errors.responsibilities = 'Har bir majburiyatni alohida qatordan yozing';
    }

    if (!data.requirements.trim()) errors.requirements = 'Kamida bitta talab yozing';
    else if (parseLines(data.requirements).length < 1) {
      errors.requirements = 'Har bir talabni alohida qatordan yozing';
    }
  }

  if (step === 3) {
    const phone = data.phone.replace(/\s/g, '');
    if (!phone) errors.phone = 'Telefon raqamini kiriting';
    else if (!/^\+?[\d\-()]{7,20}$/.test(phone)) {
      errors.phone = 'Telefon raqamini to\'g\'ri kiriting';
    }

    const isRemote = data.workType === 'remote';

    if (!isRemote && !data.address.trim()) {
      errors.address = 'Ofisdagi ish uchun manzilni kiriting';
    }

    if (!data.cityDistrict.trim()) {
      errors.cityDistrict = isRemote ? 'Masofaviy yoki shahar nomini kiriting' : 'Shahar yoki tumanni kiriting';
    }
  }

  return errors;
}

export function validateCreateJobForm(data: CreateJobFormData): CreateJobFormErrors {
  return {
    ...validateCreateJobStep(1, data),
    ...validateCreateJobStep(2, data),
    ...validateCreateJobStep(3, data),
  };
}

export function hasErrors(errors: CreateJobFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export { parseLines, parseSalary };
