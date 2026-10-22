import React, { useState, useMemo } from 'react';
import rawData from './data/desercion_data.json';
import { DistrictRecord } from './types';
import { calculateAggregates } from './utils/calculations';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { KpiCards } from './components/KpiCards';
import { InteractiveExplorer } from './components/InteractiveExplorer';
import { ChatbotSection } from './components/ChatbotSection';
import { ReportModal } from './components/ReportModal';
import { FooterSection } from './components/FooterSection';

export default function App() {
  const allRecords = rawData as DistrictRecord[];

  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedProv, setSelectedProv] = useState<string>('');
  const [selectedDist, setSelectedDist] = useState<string>('');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [attachedNotes, setAttachedNotes] = useState<string[]>([]);

  // Filter records
  const currentFilteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (selectedDept && r.departamento !== selectedDept) return false;
      if (selectedProv && r.provincia !== selectedProv) return false;
      if (selectedDist && r.distrito !== selectedDist) return false;
      return true;
    });
  }, [allRecords, selectedDept, selectedProv, selectedDist]);

  // Current aggregates for modal and report
  const currentMetrics = useMemo(() => {
    let scopeName = 'Nivel Nacional (Todo el Perú)';
    let scopeType: 'nacional' | 'departamento' | 'provincia' | 'distrito' = 'nacional';

    if (selectedDist) {
      scopeName = `Distrito de ${selectedDist}`;
      scopeType = 'distrito';
    } else if (selectedProv) {
      scopeName = `Provincia de ${selectedProv} (${selectedDept})`;
      scopeType = 'provincia';
    } else if (selectedDept) {
      scopeName = `Departamento de ${selectedDept}`;
      scopeType = 'departamento';
    }

    return calculateAggregates(currentFilteredRecords, scopeName, scopeType);
  }, [currentFilteredRecords, selectedDept, selectedProv, selectedDist]);

  const handleFilterChange = (dept: string, prov: string, dist: string) => {
    setSelectedDept(dept);
    setSelectedProv(prov);
    setSelectedDist(dist);
  };

  const handleResetFilters = () => {
    setSelectedDept('');
    setSelectedProv('');
    setSelectedDist('');
  };

  const handleScrollToExplorer = () => {
    const el = document.getElementById('explorador');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToChat = () => {
    const el = document.getElementById('asistente-aeo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAttachNote = (note: string) => {
    setAttachedNotes(prev => (prev.includes(note) ? prev : [...prev, note]));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-sky-200 selection:text-sky-950 font-sans">
      {/* 1. Header Navigation */}
      <HeaderNav
        onOpenReport={() => setIsReportModalOpen(true)}
        onScrollToChat={handleScrollToChat}
        onScrollToExplorer={handleScrollToExplorer}
      />

      <main className="flex-1">
        {/* 2. Section 1: Editorial Narrative & Header */}
        <HeroSection onExploreClick={handleScrollToExplorer} />

        {/* 3. Section 1: KPI Cards with Counter Animations & Glow */}
        <KpiCards
          onSelectDistrict={(dept, prov, dist) => handleFilterChange(dept, prov, dist)}
        />

        {/* 4. Section 2: Interactive Geographic Explorer, Contrast Panel & Chart */}
        <InteractiveExplorer
          allRecords={allRecords}
          selectedDept={selectedDept}
          selectedProv={selectedProv}
          selectedDist={selectedDist}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* 5. Section 3: AEO Data Assistant Chatbot */}
        <ChatbotSection
          allRecords={allRecords}
          onApplyFilter={(dept, prov, dist) => {
            handleFilterChange(dept || '', prov || '', dist || '');
            handleScrollToExplorer();
          }}
          onAttachToReport={handleAttachNote}
        />
      </main>

      {/* 6. Footer Section with Open Data Downloads & Transparency */}
      <FooterSection />

      {/* 7. Executive PDF Report Modal / Print View */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        metrics={currentMetrics}
        records={currentFilteredRecords}
        filterParams={{
          departamento: selectedDept,
          provincia: selectedProv,
          distrito: selectedDist,
        }}
        attachedNotes={attachedNotes}
      />
    </div>
  );
}
