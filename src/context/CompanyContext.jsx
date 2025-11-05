import React, { createContext, useState } from 'react';

export const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'Nse',
      isin: 'INE1885',
      logo: '/images/companies/nse.png',
      currentPrice: 1885,
      analysisReport: '/reports/nse-analysis.pdf',
      sector: 'Financial Services',
      founded: '1992',
      description: 'National Stock Exchange of India'
    },
    {
      id: 2,
      name: 'Msei',
      isin: 'INE2880',
      logo: '/images/companies/msei.png',
      currentPrice: 2880,
      analysisReport: '/reports/msei-analysis.pdf',
      sector: 'Financial Services',
      founded: '2008',
      description: 'Metropolitan Stock Exchange of India'
    },
    {
      id: 3,
      name: 'NCDEX',
      isin: 'INE4600',
      logo: '/images/companies/ncdex.png',
      currentPrice: 460,
      analysisReport: '/reports/ncdex-analysis.pdf',
      sector: 'Commodities Exchange',
      founded: '2003',
      description: 'National Commodity & Derivatives Exchange'
    },
    {
      id: 4,
      name: 'Pxil',
      isin: 'INE5450',
      logo: '/images/companies/pxil.png',
      currentPrice: 545,
      analysisReport: '/reports/pxil-analysis.pdf',
      sector: 'Power Exchange',
      founded: '2008',
      description: 'Power Exchange India Limited'
    },
    {
      id: 5,
      name: 'Orbis',
      isin: 'INE4770',
      logo: '/images/companies/orbis.png',
      currentPrice: 477,
      analysisReport: '/reports/orbis-analysis.pdf',
      sector: 'Financial Services',
      founded: '2009',
      description: 'Orbis Financial Corporation'
    },
    {
      id: 6,
      name: 'Onix',
      isin: 'INE0930',
      logo: '/images/companies/onix.png',
      currentPrice: 93,
      analysisReport: '/reports/onix-analysis.pdf',
      sector: 'Technology',
      founded: '2015',
      description: 'Onix Technologies'
    },
    {
      id: 7,
      name: 'Parag Parikh',
      isin: 'INE1780K',
      logo: '/images/companies/parag-parikh.png',
      currentPrice: 1780,
      analysisReport: '/reports/parag-parikh-analysis.pdf',
      sector: 'Asset Management',
      founded: '1992',
      description: 'Parag Parikh Financial Advisory Services'
    },
    {
      id: 8,
      name: 'Polymatech',
      isin: 'INE0650',
      logo: '/images/companies/polymatech.png',
      currentPrice: 65,
      analysisReport: '/reports/polymatech-analysis.pdf',
      sector: 'Manufacturing',
      founded: '2005',
      description: 'Polymatech Electronics Pvt Ltd'
    },
    {
      id: 9,
      name: 'Good luck',
      isin: 'INE3770',
      logo: '/images/companies/good-luck.png',
      currentPrice: 377,
      analysisReport: '/reports/good-luck-analysis.pdf',
      sector: 'Steel',
      founded: '1995',
      description: 'Good Luck Steel Tubes'
    },
    {
      id: 10,
      name: 'SBI',
      isin: 'INE2580',
      logo: '/images/companies/sbi.png',
      currentPrice: 2580,
      analysisReport: '/reports/sbi-analysis.pdf',
      sector: 'Banking',
      founded: '1955',
      description: 'State Bank of India Cards & Payment Services'
    },
    {
      id: 11,
      name: 'Nayara',
      isin: 'INE1255',
      logo: '/images/companies/nayara.png',
      currentPrice: 1255,
      analysisReport: '/reports/nayara-analysis.pdf',
      sector: 'Oil & Gas',
      founded: '2017',
      description: 'Nayara Energy Limited'
    },
    {
      id: 12,
      name: 'boat',
      isin: 'INE1380',
      logo: '/images/companies/boat.png',
      currentPrice: 1380,
      analysisReport: '/reports/boat-analysis.pdf',
      sector: 'Consumer Electronics',
      founded: '2016',
      description: 'boAt Lifestyle'
    },
    {
      id: 13,
      name: 'Apollo green',
      isin: 'INE1450',
      logo: '/images/companies/apollo-green.png',
      currentPrice: 145,
      analysisReport: '/reports/apollo-green-analysis.pdf',
      sector: 'Energy',
      founded: '2019',
      description: 'Apollo Green Energy'
    },
    {
      id: 14,
      name: 'Oyo',
      isin: 'INE2650',
      logo: '/images/companies/oyo.png',
      currentPrice: 265,
      analysisReport: '/reports/oyo-analysis.pdf',
      sector: 'Hospitality',
      founded: '2013',
      description: 'OYO Rooms'
    },
    {
      id: 15,
      name: 'Pine Lab',
      isin: 'INE2980',
      logo: '/images/companies/pine-lab.png',
      currentPrice: 298,
      analysisReport: '/reports/pine-lab-analysis.pdf',
      sector: 'Fintech',
      founded: '1998',
      description: 'Pine Labs Payment Solutions'
    },
    {
      id: 16,
      name: 'NERL',
      isin: 'INE0640',
      logo: '/images/companies/nerl.png',
      currentPrice: 64,
      analysisReport: '/reports/nerl-analysis.pdf',
      sector: 'Energy',
      founded: '2007',
      description: 'National E-Registry Limited'
    },
    {
      id: 17,
      name: 'Incred',
      isin: 'INE1570',
      logo: '/images/companies/incred.png',
      currentPrice: 157,
      analysisReport: '/reports/incred-analysis.pdf',
      sector: 'NBFC',
      founded: '2016',
      description: 'InCred Financial Services'
    },
    {
      id: 18,
      name: 'A1 steel',
      isin: 'INE2740',
      logo: '/images/companies/a1-steel.png',
      currentPrice: 274,
      analysisReport: '/reports/a1-steel-analysis.pdf',
      sector: 'Steel',
      founded: '2010',
      description: 'A1 Steel & Power'
    },
    {
      id: 19,
      name: 'Boat at',
      isin: 'INE1380',
      logo: '/images/companies/boat.png',
      currentPrice: 1380,
      analysisReport: '/reports/boat-analysis.pdf',
      sector: 'Consumer Electronics',
      founded: '2016',
      description: 'boAt Audio Technologies'
    },
    {
      id: 20,
      name: 'Greenzo',
      isin: 'INE6050',
      logo: '/images/companies/greenzo.png',
      currentPrice: 605,
      analysisReport: '/reports/greenzo-analysis.pdf',
      sector: 'Green Energy',
      founded: '2018',
      description: 'Greenzo Energy'
    },
    {
      id: 21,
      name: 'Cial',
      isin: 'INE4580',
      logo: '/images/companies/cial.png',
      currentPrice: 458,
      analysisReport: '/reports/cial-analysis.pdf',
      sector: 'Aviation',
      founded: '1999',
      description: 'Cochin International Airport Limited'
    },
    {
      id: 22,
      name: 'API holdings',
      isin: 'INE5800',
      logo: '/images/companies/api-holdings.png',
      currentPrice: 580,
      analysisReport: '/reports/api-holdings-analysis.pdf',
      sector: 'Healthcare',
      founded: '2015',
      description: 'API Holdings (PharmEasy)'
    },
    {
      id: 23,
      name: 'Ather energy',
      isin: 'INE8200',
      logo: '/images/companies/ather.png',
      currentPrice: 820,
      analysisReport: '/reports/ather-analysis.pdf',
      sector: 'Electric Vehicles',
      founded: '2013',
      description: 'Ather Energy Pvt Ltd'
    },
    {
      id: 24,
      name: 'Hdfc sec',
      isin: 'INE9300',
      logo: '/images/companies/hdfc-sec.png',
      currentPrice: 9300,
      analysisReport: '/reports/hdfc-sec-analysis.pdf',
      sector: 'Financial Services',
      founded: '2000',
      description: 'HDFC Securities Limited'
    },
    {
      id: 25,
      name: 'Moolaah',
      isin: 'INE2025M',
      logo: '/images/companies/moolaah.png',
      currentPrice: 1250,
      analysisReport: '/data/MOOLAAH-PRE-IPO-2025-1.pdf',
      sector: 'Fintech',
      founded: '2018',
      description: 'Moolaah - Pre-IPO Investment Platform'
    },
    {
      id: 26,
      name: 'TechVision AI',
      isin: 'INE5500',
      logo: '/images/companies/techvision.png',
      currentPrice: 550,
      analysisReport: '/data/MOOLAAH-PRE-IPO-2025-1.pdf',
      sector: 'Artificial Intelligence',
      founded: '2019',
      description: 'TechVision AI - Leading AI Solutions Provider'
    },
    {
      id: 27,
      name: 'Swiggy',
      isin: 'INE8500',
      logo: '/images/companies/swiggy.png',
      currentPrice: 850,
      analysisReport: '/data/MOOLAAH-PRE-IPO-2025-1.pdf',
      sector: 'Food Delivery',
      founded: '2014',
      description: 'Swiggy - Online Food Ordering and Delivery'
    },
    {
      id: 28,
      name: 'Zerodha',
      isin: 'INE1200',
      logo: '/images/companies/zerodha.png',
      currentPrice: 1200,
      analysisReport: '/data/MOOLAAH-PRE-IPO-2025-1.pdf',
      sector: 'Stock Broking',
      founded: '2010',
      description: 'Zerodha - India\'s Largest Discount Broker'
    },
    {
      id: 29,
      name: 'Dream11',
      isin: 'INE9500',
      logo: '/images/companies/dream11.png',
      currentPrice: 950,
      analysisReport: '/data/MOOLAAH-PRE-IPO-2025-1.pdf',
      sector: 'Fantasy Sports',
      founded: '2008',
      description: 'Dream11 - Fantasy Sports Platform'
    },
    {
      id: 30,
      name: "BYJU'S",
      isin: 'INE6800',
      logo: '/images/companies/byjus.png',
      currentPrice: 680,
      analysisReport: '/data/MOOLAAH-PRE-IPO-2025-1.pdf',
      sector: 'EdTech',
      founded: '2011',
      description: 'BYJU\'S - The Learning App'
    }
  ]);

  // Add new company
  const addCompany = (companyData) => {
    const newCompany = {
      id: Date.now(),
      ...companyData,
      addedAt: new Date().toISOString()
    };
    setCompanies([...companies, newCompany]);
    return { success: true, company: newCompany };
  };

  // Update existing company
  const updateCompany = (id, updatedData) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, ...updatedData, updatedAt: new Date().toISOString() } : company
    ));
    return { success: true };
  };

  // Delete company
  const deleteCompany = (id) => {
    setCompanies(companies.filter(company => company.id !== id));
    return { success: true };
  };

  // Search company by name or ISIN
  const searchCompany = (query) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return companies.filter(company => 
      company.name.toLowerCase().includes(lowerQuery) || 
      company.isin.toLowerCase().includes(lowerQuery)
    );
  };

  // Get company by ISIN
  const getCompanyByISIN = (isin) => {
    return companies.find(company => company.isin === isin);
  };

  // Get company by name
  const getCompanyByName = (name) => {
    return companies.find(company => 
      company.name.toLowerCase() === name.toLowerCase()
    );
  };

  return (
    <CompanyContext.Provider value={{
      companies,
      addCompany,
      updateCompany,
      deleteCompany,
      searchCompany,
      getCompanyByISIN,
      getCompanyByName
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return React.useContext(CompanyContext);
}
