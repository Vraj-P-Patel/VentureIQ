from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        import sys
        if 'runserver' in sys.argv:
            from django.db.models.signals import post_migrate
            from django.dispatch import receiver

            def run_seeder(sender, **kwargs):
                try:
                    from .seeder import seed_database
                    seed_database()
                except Exception as e:
                    print("Seeding skipped:", e)

            post_migrate.connect(run_seeder, sender=self)
