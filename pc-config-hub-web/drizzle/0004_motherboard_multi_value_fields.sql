UPDATE "components"
SET "specs" = "specs" || jsonb_build_object(
  'ramTypes',
  CASE
    WHEN jsonb_typeof("specs"->'ramTypes') = 'array' THEN "specs"->'ramTypes'
    WHEN "specs"->>'ramType' IS NOT NULL THEN jsonb_build_array("specs"->>'ramType')
    ELSE '[]'::jsonb
  END
)
WHERE "category_slug" = 'motherboard';
