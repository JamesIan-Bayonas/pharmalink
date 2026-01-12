USE [PharmaLinkDB]
GO

-- =============================================
-- 1. INSERT CATEGORIES
-- =============================================
-- We use a variable table to ensure we map medicines to the correct new IDs
DECLARE @CatIds TABLE (Name NVARCHAR(100), Id INT);

INSERT INTO Categories (Name)
OUTPUT Inserted.Name, Inserted.Id INTO @CatIds
VALUES 
('Antibiotics'),
('Analgesics'),
('Antihistamines'),
('Vitamins'),
('Cardiovascular'),
('Gastrointestinal'),
('Dermatological'),
('Respiratory'),
('Endocrine'),
('Neurological');

-- Helper variables for ID reference
DECLARE @Antibiotics INT = (SELECT Id FROM @CatIds WHERE Name = 'Antibiotics');
DECLARE @Analgesics INT = (SELECT Id FROM @CatIds WHERE Name = 'Analgesics');
DECLARE @Antihistamines INT = (SELECT Id FROM @CatIds WHERE Name = 'Antihistamines');
DECLARE @Vitamins INT = (SELECT Id FROM @CatIds WHERE Name = 'Vitamins');
DECLARE @Cardio INT = (SELECT Id FROM @CatIds WHERE Name = 'Cardiovascular');
DECLARE @Gastro INT = (SELECT Id FROM @CatIds WHERE Name = 'Gastrointestinal');
DECLARE @Derma INT = (SELECT Id FROM @CatIds WHERE Name = 'Dermatological');
DECLARE @Respiratory INT = (SELECT Id FROM @CatIds WHERE Name = 'Respiratory');
DECLARE @Endocrine INT = (SELECT Id FROM @CatIds WHERE Name = 'Endocrine');
DECLARE @Neuro INT = (SELECT Id FROM @CatIds WHERE Name = 'Neurological');

-- =============================================
-- 2. INSERT MEDICINES (15 per Category)
-- =============================================

-- 1. Antibiotics
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Antibiotics, 'Amoxicillin 500mg', 500, 15.00, '2028-06-30', 'Broad-spectrum antibiotic.'),
(@Antibiotics, 'Ciprofloxacin 500mg', 200, 22.50, '2027-12-15', 'For urinary tract infections.'),
(@Antibiotics, 'Azithromycin 500mg', 150, 45.00, '2026-11-20', 'Z-Pak; for respiratory infections.'),
(@Antibiotics, 'Cephalexin 500mg', 300, 18.75, '2028-01-10', 'For skin and ear infections.'),
(@Antibiotics, 'Doxycycline 100mg', 180, 12.00, '2027-05-25', 'For acne and pneumonia.'),
(@Antibiotics, 'Clindamycin 300mg', 120, 35.00, '2026-09-14', 'For serious bacterial infections.'),
(@Antibiotics, 'Levofloxacin 500mg', 100, 55.00, '2028-03-30', 'Fluoroquinolone antibiotic.'),
(@Antibiotics, 'Metronidazole 500mg', 250, 10.00, '2027-08-05', 'For anaerobic infections.'),
(@Antibiotics, 'Co-Amoxiclav 625mg', 400, 28.00, '2028-02-14', 'Augmentin; strong antibiotic.'),
(@Antibiotics, 'Sulfamethoxazole', 150, 16.50, '2027-11-30', 'Bactrim; for UTIs.'),
(@Antibiotics, 'Erythromycin 250mg', 100, 20.00, '2026-12-01', 'Macrolide antibiotic.'),
(@Antibiotics, 'Clarithromycin 500mg', 140, 48.00, '2028-07-22', 'For H. pylori infection.'),
(@Antibiotics, 'Nitrofurantoin 100mg', 90, 25.00, '2027-04-18', 'Specific for bladder infections.'),
(@Antibiotics, 'Tetracycline 250mg', 110, 8.50, '2026-10-10', 'Older broad-spectrum antibiotic.'),
(@Antibiotics, 'Cefuroxime 500mg', 220, 32.00, '2028-05-05', 'Ceftin; for sinus infections.');

-- 2. Analgesics
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Analgesics, 'Paracetamol 500mg', 1000, 5.00, '2029-01-01', 'Biogesic; for fever and headache.'),
(@Analgesics, 'Ibuprofen 200mg', 500, 8.00, '2028-05-15', 'Advil; anti-inflammatory.'),
(@Analgesics, 'Mefenamic Acid 500mg', 300, 12.00, '2027-12-20', 'Ponstan; for toothache.'),
(@Analgesics, 'Naproxen 550mg', 200, 15.00, '2028-08-10', 'Flanax; for muscle pain.'),
(@Analgesics, 'Tramadol 50mg', 100, 25.00, '2026-11-30', 'Prescription pain reliever.'),
(@Analgesics, 'Celecoxib 200mg', 150, 35.00, '2027-04-25', 'Celebrex; for arthritis.'),
(@Analgesics, 'Aspirin 80mg', 600, 3.00, '2028-02-14', 'Blood thinner/pain relief.'),
(@Analgesics, 'Diclofenac Sodium 50mg', 250, 10.00, '2027-09-05', 'Voltaren; joint pain.'),
(@Analgesics, 'Ketorolac 10mg', 80, 40.00, '2026-10-10', 'Strong short-term pain relief.'),
(@Analgesics, 'Etoricoxib 90mg', 120, 45.00, '2028-06-18', 'Arcoxia; gout and arthritis.'),
(@Analgesics, 'Butorphanol 1mg', 50, 150.00, '2026-08-01', 'Nasal spray for migraines.'),
(@Analgesics, 'Gabapentin 300mg', 200, 18.00, '2027-12-12', 'Nerve pain reliever.'),
(@Analgesics, 'Pregabalin 75mg', 180, 28.00, '2028-03-30', 'Lyrica; nerve pain.'),
(@Analgesics, 'Meloxicam 15mg', 140, 14.00, '2027-07-22', 'Mobic; osteoarthritis.'),
(@Analgesics, 'Indomethacin 25mg', 90, 11.00, '2026-12-31', 'For gout attacks.');

-- 3. Antihistamines
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Antihistamines, 'Cetirizine 10mg', 600, 5.00, '2029-02-15', 'Non-drowsy allergy relief.'),
(@Antihistamines, 'Loratadine 10mg', 550, 6.00, '2028-11-20', 'Claritin; daily allergy relief.'),
(@Antihistamines, 'Diphenhydramine 50mg', 300, 3.50, '2027-06-30', 'Benadryl; causes drowsiness.'),
(@Antihistamines, 'Fexofenadine 180mg', 200, 18.00, '2028-09-10', 'Allegra; non-sedating.'),
(@Antihistamines, 'Levocetirizine 5mg', 250, 12.00, '2029-01-05', 'Xyzal; for hives and rhinitis.'),
(@Antihistamines, 'Chlorpheniramine 4mg', 400, 2.00, '2027-08-15', 'Old school allergy tab.'),
(@Antihistamines, 'Desloratadine 5mg', 180, 14.00, '2028-04-22', 'Aerius; long acting.'),
(@Antihistamines, 'Promethazine 25mg', 100, 8.00, '2026-12-12', 'For nausea and allergies.'),
(@Antihistamines, 'Bilastine 20mg', 150, 22.00, '2028-07-07', 'New generation antihistamine.'),
(@Antihistamines, 'Hydroxyzine 25mg', 120, 15.00, '2027-03-14', 'Iterax; for itching and anxiety.'),
(@Antihistamines, 'Rupatadine 10mg', 110, 20.00, '2028-10-30', 'For allergic rhinitis.'),
(@Antihistamines, 'Ebastine 10mg', 130, 19.00, '2027-05-05', 'For seasonal allergies.'),
(@Antihistamines, 'Ketotifen 1mg', 140, 11.00, '2029-02-28', 'Asthma preventative.'),
(@Antihistamines, 'Clemastine 1mg', 90, 9.00, '2026-11-11', 'Tavegyl; for itching.'),
(@Antihistamines, 'Meclizine 25mg', 160, 7.50, '2028-01-20', 'Bonamine; motion sickness.');

-- 4. Vitamins
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Vitamins, 'Ascorbic Acid 500mg', 900, 3.00, '2028-12-15', 'Vitamin C; immune boost.'),
(@Vitamins, 'Centrum Advance', 300, 12.00, '2029-03-01', 'Complete multivitamin.'),
(@Vitamins, 'Vitamin B Complex', 400, 8.50, '2027-10-20', 'Nerve tonic.'),
(@Vitamins, 'Ferrous Sulfate', 500, 2.50, '2026-12-30', 'Iron supplement.'),
(@Vitamins, 'Calcium + D3', 350, 10.00, '2028-05-10', 'Bone health.'),
(@Vitamins, 'Vitamin E 400IU', 200, 9.00, '2027-09-15', 'Myra E; skin health.'),
(@Vitamins, 'Zinc Gluconate 30mg', 250, 6.00, '2028-02-28', 'Immune support.'),
(@Vitamins, 'Folic Acid 5mg', 300, 4.00, '2027-11-05', 'For pregnancy support.'),
(@Vitamins, 'Vitamin D3 1000IU', 400, 7.00, '2029-01-20', 'Sunshine vitamin.'),
(@Vitamins, 'Potren (Potassium)', 150, 15.00, '2026-08-15', 'Potassium supplement.'),
(@Vitamins, 'Neurobion', 250, 18.00, '2028-06-12', 'High potency B-vitamins.'),
(@Vitamins, 'Conzace', 200, 14.00, '2027-12-01', 'Multivitamin with Zinc.'),
(@Vitamins, 'Clusivol', 180, 11.00, '2028-04-18', 'Daily supplement.'),
(@Vitamins, 'Enervon-C', 350, 6.50, '2027-07-30', 'Energy booster.'),
(@Vitamins, 'Fish Oil 1000mg', 120, 10.00, '2026-11-25', 'Omega-3 fatty acids.');

-- 5. Cardiovascular
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Cardio, 'Amlodipine 5mg', 500, 5.00, '2028-10-10', 'For high blood pressure.'),
(@Cardio, 'Losartan 50mg', 450, 8.00, '2029-01-15', 'Hypertension maintenance.'),
(@Cardio, 'Atorvastatin 20mg', 400, 12.00, '2028-06-20', 'Lowers cholesterol.'),
(@Cardio, 'Metoprolol 50mg', 300, 7.50, '2027-11-05', 'Beta-blocker.'),
(@Cardio, 'Lisinopril 10mg', 350, 6.00, '2028-03-30', 'ACE inhibitor.'),
(@Cardio, 'Simvastatin 20mg', 250, 9.00, '2027-08-25', 'Cholesterol control.'),
(@Cardio, 'Clopidogrel 75mg', 200, 25.00, '2028-02-14', 'Anti-platelet; prevents stroke.'),
(@Cardio, 'Carvedilol 6.25mg', 180, 10.00, '2027-12-12', 'Heart failure medication.'),
(@Cardio, 'Rosuvastatin 10mg', 220, 18.00, '2029-04-05', 'Crestor; potent statin.'),
(@Cardio, 'Telmisartan 40mg', 190, 19.00, '2028-09-09', 'Micardis; hypertension.'),
(@Cardio, 'Bisoprolol 5mg', 240, 11.00, '2028-07-15', 'Concore; heart rate control.'),
(@Cardio, 'Furosemide 40mg', 200, 3.00, '2027-05-01', 'Lasix; diuretic.'),
(@Cardio, 'Spironolactone 25mg', 150, 9.50, '2026-10-30', 'Aldactone; potassium-sparing.'),
(@Cardio, 'Isosorbide Mononitrate', 100, 14.00, '2027-01-20', 'Imdur; prevents chest pain.'),
(@Cardio, 'Digoxin 0.25mg', 80, 8.50, '2026-09-15', 'Lanoxin; for heart failure.');

-- 6. Gastrointestinal
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Gastro, 'Omeprazole 20mg', 600, 4.00, '2028-04-10', 'Acid reducer.'),
(@Gastro, 'Loperamide 2mg', 500, 3.00, '2029-05-20', 'Imodium; stops diarrhea.'),
(@Gastro, 'Pantoprazole 40mg', 300, 15.00, '2028-01-15', 'Stomach protector.'),
(@Gastro, 'Ranitidine 150mg', 200, 5.00, '2026-12-10', 'Zantac; heartburn.'),
(@Gastro, 'Famotidine 20mg', 250, 8.00, '2027-11-30', 'Pepcid; indigestion.'),
(@Gastro, 'Bisacodyl 5mg', 400, 2.50, '2028-08-05', 'Dulcolax; laxative.'),
(@Gastro, 'Hyoscine (Buscopan)', 220, 18.00, '2028-03-22', 'Stomach cramps.'),
(@Gastro, 'Domperidone 10mg', 200, 10.00, '2027-09-12', 'Motilium; anti-nausea.'),
(@Gastro, 'Metoclopramide 10mg', 160, 6.00, '2026-11-18', 'Plasil; vomiting.'),
(@Gastro, 'Simethicone 40mg', 350, 4.50, '2029-02-28', 'Relieves gas/bloating.'),
(@Gastro, 'Lansoprazole 30mg', 170, 20.00, '2028-06-15', 'Prevacid; ulcers.'),
(@Gastro, 'Oral Rehydration Salts', 800, 5.00, '2030-01-01', 'Hydrite; electrolytes.'),
(@Gastro, 'Probiotics (Erceflora)', 300, 40.00, '2027-05-10', 'Gut health.'),
(@Gastro, 'Gaviscon Liquid', 100, 250.00, '2026-12-25', 'Heartburn relief.'),
(@Gastro, 'Kremil-S', 450, 8.00, '2028-10-05', 'Antacid + antiflatulent.');

-- 7. Dermatological
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Derma, 'Hydrocortisone 1%', 200, 150.00, '2027-04-10', 'Mild steroid cream.'),
(@Derma, 'Betamethasone Cream', 150, 180.00, '2028-02-15', 'Strong steroid cream.'),
(@Derma, 'Clotrimazole 1%', 250, 120.00, '2027-12-05', 'Canesten; antifungal.'),
(@Derma, 'Ketoconazole 2%', 120, 250.00, '2028-05-20', 'Nizoral; fungal infection.'),
(@Derma, 'Mupirocin Ointment', 180, 300.00, '2027-08-30', 'Bactroban; antibacterial.'),
(@Derma, 'Permethrin Lotion', 100, 400.00, '2026-11-10', 'Kwell; for scabies.'),
(@Derma, 'Calamine Lotion', 300, 85.00, '2028-07-15', 'Soothing lotion.'),
(@Derma, 'Silver Sulfadiazine', 80, 350.00, '2027-03-01', 'Flamazine; burn cream.'),
(@Derma, 'Tretinoin 0.05%', 90, 500.00, '2027-09-20', 'Acne treatment.'),
(@Derma, 'Benzoyl Peroxide', 140, 220.00, '2028-01-12', 'Benzac; acne gel.'),
(@Derma, 'Salicylic Acid', 110, 150.00, '2029-02-05', 'Wart remover.'),
(@Derma, 'Terbinafine Cream', 130, 280.00, '2028-06-18', 'Lamisil; athlete foot.'),
(@Derma, 'Acyclovir Cream', 95, 320.00, '2027-11-25', 'Zovirax; cold sores.'),
(@Derma, 'Fusidic Acid', 160, 290.00, '2028-08-08', 'Fucidin; antibiotic.'),
(@Derma, 'Mometasone Cream', 145, 275.00, '2028-10-30', 'Elica; rash relief.');

-- 8. Respiratory
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Respiratory, 'Salbutamol Inhaler', 150, 350.00, '2027-05-15', 'Ventolin; asthma rescue.'),
(@Respiratory, 'Fluticasone Spray', 100, 450.00, '2028-02-10', 'Avamys; nasal allergy.'),
(@Respiratory, 'Montelukast 10mg', 200, 25.00, '2028-09-01', 'Singulair; asthma prevent.'),
(@Respiratory, 'Theophylline 200mg', 80, 12.00, '2027-04-20', 'Bronchodilator.'),
(@Respiratory, 'Budesonide Nebule', 300, 45.00, '2028-12-15', 'Pulmicort; nebulizer.'),
(@Respiratory, 'Guaifenesin Syrup', 250, 95.00, '2029-03-10', 'Robitussin; expectorant.'),
(@Respiratory, 'Ambroxol 30mg', 400, 5.00, '2028-07-25', 'Mucosolvan; mucolytic.'),
(@Respiratory, 'Carbocisteine 500mg', 350, 8.00, '2028-06-05', 'Solmux; cough.'),
(@Respiratory, 'Bromhexine 8mg', 300, 6.00, '2027-11-12', 'Bisolvon; cough.'),
(@Respiratory, 'Dextromethorphan', 200, 120.00, '2028-09-30', 'Dry cough syrup.'),
(@Respiratory, 'Phenylephrine', 220, 7.00, '2027-08-15', 'Decongestant.'),
(@Respiratory, 'Acetylcysteine 600mg', 150, 20.00, '2028-03-20', 'Fluimucil; fizzy tab.'),
(@Respiratory, 'Salbutamol Nebule', 500, 25.00, '2029-01-05', 'Ventolin nebule.'),
(@Respiratory, 'Lagundi 600mg', 300, 6.50, '2028-05-18', 'Ascof; herbal cough.'),
(@Respiratory, 'Butamirate 50mg', 120, 18.00, '2028-02-28', 'Sinecod; dry cough.');

-- 9. Endocrine
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Endocrine, 'Metformin 500mg', 800, 3.00, '2029-02-10', 'Glucophage; diabetes.'),
(@Endocrine, 'Gliclazide 80mg', 400, 5.00, '2028-08-05', 'Diamicron; diabetes.'),
(@Endocrine, 'Levothyroxine 50mcg', 300, 6.00, '2028-11-15', 'Euthyrox; thyroid.'),
(@Endocrine, 'Carbimazole 5mg', 150, 12.00, '2027-09-20', 'Hyperthyroid.'),
(@Endocrine, 'Glimepiride 2mg', 350, 8.00, '2028-04-30', 'Solosa; diabetes.'),
(@Endocrine, 'Sitagliptin 100mg', 200, 35.00, '2028-10-12', 'Januvia; diabetes.'),
(@Endocrine, 'Pioglitazone 30mg', 120, 20.00, '2027-06-25', 'Actos; diabetes.'),
(@Endocrine, 'Empagliflozin 10mg', 100, 45.00, '2029-01-08', 'Jardiance.'),
(@Endocrine, 'Vildagliptin 50mg', 130, 28.00, '2028-12-18', 'Galvus.'),
(@Endocrine, 'Methimazole 5mg', 200, 10.00, '2028-03-15', 'Tapazole.'),
(@Endocrine, 'Prednisone 5mg', 200, 3.00, '2027-08-22', 'Steroid.'),
(@Endocrine, 'Dexamethasone 4mg', 180, 12.00, '2027-10-10', 'Strong steroid.'),
(@Endocrine, 'Insulin Glargine', 40, 900.00, '2027-04-05', 'Lantus pen.'),
(@Endocrine, 'Insulin Regular', 50, 450.00, '2026-11-15', 'Humulin R.'),
(@Endocrine, 'Dapagliflozin 10mg', 95, 48.00, '2028-07-30', 'Forxiga.');

-- 10. Neurological
INSERT INTO Medicines (CategoryId, Name, StockQuantity, Price, ExpiryDate, Description) VALUES
(@Neuro, 'Gabapentin 300mg', 300, 15.00, '2028-06-10', 'Neurontin.'),
(@Neuro, 'Carbamazepine 200mg', 200, 8.00, '2027-09-25', 'Tegretol; seizure.'),
(@Neuro, 'Valproic Acid 250mg', 150, 18.00, '2028-02-14', 'Depakote.'),
(@Neuro, 'Levetiracetam 500mg', 180, 35.00, '2029-01-20', 'Keppra.'),
(@Neuro, 'Lamotrigine 100mg', 120, 20.00, '2028-05-30', 'Lamictal.'),
(@Neuro, 'Topiramate 50mg', 100, 28.00, '2027-10-15', 'Topamax; migraine.'),
(@Neuro, 'Clonazepam 2mg', 140, 12.00, '2028-04-12', 'Rivotril; panic.'),
(@Neuro, 'Diazepam 5mg', 160, 10.00, '2027-08-08', 'Valium; anxiety.'),
(@Neuro, 'Alprazolam 500mcg', 130, 15.00, '2028-01-30', 'Xanax.'),
(@Neuro, 'Sertraline 50mg', 220, 22.00, '2028-09-18', 'Zoloft; depression.'),
(@Neuro, 'Fluoxetine 20mg', 200, 18.00, '2027-12-05', 'Prozac.'),
(@Neuro, 'Escitalopram 10mg', 210, 25.00, '2028-07-22', 'Lexapro.'),
(@Neuro, 'Risperidone 2mg', 80, 20.00, '2028-02-25', 'Antipsychotic.'),
(@Neuro, 'Quetiapine 100mg', 95, 38.00, '2028-03-28', 'Seroquel.'),
(@Neuro, 'Betahistine 24mg', 250, 35.00, '2028-08-15', 'Serc; vertigo.');

GO