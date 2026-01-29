'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/Label';
import { useWizard } from '@/contexts/WizardContext';
import { formatDateInPortuguese } from '@/lib/wizard-utils';
import { Calendar, X } from 'lucide-react';

/**
 * Step 2: Special Date Component
 * Allows users to select a special date for their message
 * Features:
 * - Separate selectors for day, month, and year
 * - Formats date in Portuguese (DD de MMMM, YYYY)
 * - Optional date selection (skip functionality)
 * - Updates preview in real-time
 */
export function Step2SpecialDate() {
  const { data, updateField } = useWizard();
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Local state for partial date selections
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Initialize local state from data.specialDate when it exists
  React.useEffect(() => {
    if (data.specialDate) {
      setSelectedDay(String(data.specialDate.getDate()));
      setSelectedMonth(String(data.specialDate.getMonth() + 1));
      setSelectedYear(String(data.specialDate.getFullYear()));
    }
  }, [data.specialDate]);

  // Month names in Portuguese
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Generate year options (from 1950 to current year + 10)
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: currentYearNum - 1950 + 11 }, (_, i) => currentYearNum + 10 - i);

  // Calculate max days based on selected month and year
  const getMaxDays = () => {
    if (!selectedMonth || !selectedYear) return 31;
    const month = Number(selectedMonth);
    const year = Number(selectedYear);
    // Get the last day of the month (day 0 of next month)
    return new Date(year, month, 0).getDate();
  };

  const maxDays = getMaxDays();
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Handle date part changes
  const handleDatePartChange = (part: 'day' | 'month' | 'year', value: string) => {
    // Update local state
    if (part === 'day') {
      setSelectedDay(value);
    } else if (part === 'month') {
      setSelectedMonth(value);
      // Reset day if it's invalid for the new month
      if (selectedDay && selectedYear && value) {
        const maxDaysInMonth = new Date(Number(selectedYear), Number(value), 0).getDate();
        if (Number(selectedDay) > maxDaysInMonth) {
          setSelectedDay('');
        }
      }
    } else if (part === 'year') {
      setSelectedYear(value);
      // Reset day if it's invalid for the new year (leap year check)
      if (selectedDay && selectedMonth && value) {
        const maxDaysInMonth = new Date(Number(value), Number(selectedMonth), 0).getDate();
        if (Number(selectedDay) > maxDaysInMonth) {
          setSelectedDay('');
        }
      }
    }

    // Get the complete date parts
    const day = part === 'day' ? value : selectedDay;
    const month = part === 'month' ? value : selectedMonth;
    const year = part === 'year' ? value : selectedYear;

    // Only create date if all parts are selected
    if (day && month && year) {
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      updateField('specialDate', date);
    }
  };

  // Check if we have a complete date selected
  const hasCompleteDate = selectedDay && selectedMonth && selectedYear;

  // Clear date
  const clearDate = () => {
    setSelectedDay('');
    setSelectedMonth('');
    setSelectedYear('');
    updateField('specialDate', null);
    setShowDatePicker(false);
  };

  // Skip date selection
  const skipDate = () => {
    setSelectedDay('');
    setSelectedMonth('');
    setSelectedYear('');
    updateField('specialDate', null);
    setShowDatePicker(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Data Especial
        </h2>
        <p className="text-gray-600">
          Adicione uma data especial à sua mensagem (opcional).
        </p>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        {!data.specialDate && !showDatePicker ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Selecionar Data
            </button>
            <button
              type="button"
              onClick={skipDate}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Pular esta etapa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Selecione a Data
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {/* Month Selector */}
                <div>
                  <Label htmlFor="month" className="text-xs text-gray-600 mb-1">
                    Mês
                  </Label>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => handleDatePartChange('month', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    aria-label="Selecione o mês"
                  >
                    <option value="">Mês</option>
                    {monthNames.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Selector */}
                <div>
                  <Label htmlFor="year" className="text-xs text-gray-600 mb-1">
                    Ano
                  </Label>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => handleDatePartChange('year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    aria-label="Selecione o ano"
                  >
                    <option value="">Ano</option>
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day Selector */}
                <div>
                  <Label htmlFor="day" className="text-xs text-gray-600 mb-1">
                    Dia
                  </Label>
                  <select
                    id="day"
                    value={selectedDay}
                    onChange={(e) => handleDatePartChange('day', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    aria-label="Selecione o dia"
                    disabled={!selectedMonth || !selectedYear}
                  >
                    <option value="">Dia</option>
                    {days.map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {hasCompleteDate && (
                <button
                  type="button"
                  onClick={clearDate}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mt-2"
                  aria-label="Limpar data"
                >
                  <X className="w-4 h-4" />
                  Limpar data
                </button>
              )}
            </div>

            {hasCompleteDate && data.specialDate && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Data Formatada:
                  </p>
                  <p className="text-lg text-blue-700 font-semibold">
                    {formatDateInPortuguese(data.specialDate)}
                  </p>
                </div>

                {/* Time Counter Option */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="showTimeCounter"
                      checked={data.showTimeCounter}
                      onChange={(e) => updateField('showTimeCounter', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="showTimeCounter" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Mostrar contador de tempo
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Exibe quanto tempo se passou desde esta data (anos, meses, dias, horas, minutos e segundos)
                      </p>
                    </div>
                  </div>

                  {data.showTimeCounter && (
                    <div className="space-y-2 pl-7">
                      <Label htmlFor="timeCounterLabel">
                        Nome da Data (ex: Primeiro Beijo, Início do Namoro)
                      </Label>
                      <input
                        type="text"
                        id="timeCounterLabel"
                        value={data.timeCounterLabel}
                        onChange={(e) => updateField('timeCounterLabel', e.target.value)}
                        placeholder="Ex: Primeiro Beijo, Casamento, Início da Amizade..."
                        maxLength={50}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500">
                        {data.timeCounterLabel.length}/50 caracteres
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={skipDate}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Remover data e pular esta etapa
            </button>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          💡 Dica
        </h3>
        <p className="text-sm text-gray-700">
          A data especial aparecerá na sua mensagem formatada em português. 
          Perfeito para aniversários, casamentos, formaturas e outras ocasiões especiais!
        </p>
      </div>
    </div>
  );
}
