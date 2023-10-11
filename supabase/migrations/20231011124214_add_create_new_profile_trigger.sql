DROP TRIGGER IF EXISTS create_new_profile_for_user on auth.users;
CREATE TRIGGER create_new_profile_for_user AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();