-- Optional starter content. Run AFTER schema.sql.
-- Mirrors the structure of Illustrated Mind Mapping for A&P:
-- foundations -> tissues -> organ systems.
-- All lessons start unpublished so Peter can fill them in and publish.

insert into public.courses (slug, title, description, position, published) values
  ('ap1', 'Anatomy & Physiology I',
   'Foundations of A&P: cells, tissues, and the integumentary, skeletal, muscular, and nervous systems.',
   1, true),
  ('ap2', 'Anatomy & Physiology II',
   'Endocrine, cardiovascular, lymphatic, respiratory, digestive, urinary, and reproductive systems.',
   2, false)
on conflict (slug) do nothing;

with c as (select id from public.courses where slug = 'ap1')
insert into public.units (course_id, slug, title, position)
select c.id, u.slug, u.title, u.position from c, (values
  ('intro', 'Introduction & Body Organization', 1),
  ('cells', 'Cells', 2),
  ('tissues', 'Tissues', 3),
  ('integumentary', 'Integumentary System', 4),
  ('skeletal', 'Skeletal System', 5),
  ('muscular', 'Muscular System', 6),
  ('nervous', 'Nervous System', 7)
) as u(slug, title, position)
on conflict (course_id, slug) do nothing;

with c as (select id from public.courses where slug = 'ap2')
insert into public.units (course_id, slug, title, position)
select c.id, u.slug, u.title, u.position from c, (values
  ('endocrine', 'Endocrine System', 1),
  ('cardiovascular', 'Cardiovascular System', 2),
  ('lymphatic', 'Lymphatic & Immune Systems', 3),
  ('respiratory', 'Respiratory System', 4),
  ('digestive', 'Digestive System', 5),
  ('urinary', 'Urinary System', 6),
  ('reproductive', 'Reproductive System', 7)
) as u(slug, title, position)
on conflict (course_id, slug) do nothing;

-- A few example lesson rows (unpublished) to show the editing flow.
with u as (select id from public.units where slug = 'cells')
insert into public.lessons (unit_id, slug, title, description, video_source, position, published)
select u.id, l.slug, l.title, l.description, 'none', l.position, false from u, (values
  ('cell-membrane', 'The Cell Membrane', 'Structure, function, and transport across the membrane.', 1),
  ('organelles', 'Organelles', 'Mind-mapping the parts of the cell and what each one does.', 2),
  ('cell-cycle', 'The Cell Cycle', 'Interphase, mitosis, and cytokinesis at a glance.', 3)
) as l(slug, title, description, position)
on conflict (unit_id, slug) do nothing;
