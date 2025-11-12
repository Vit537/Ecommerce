"""
Comando para limpiar carritos duplicados en la base de datos
"""
from django.core.management.base import BaseCommand
from django.db.models import Count
from cart.models import Cart


class Command(BaseCommand):
    help = 'Limpia carritos duplicados manteniendo el más reciente para cada usuario'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Buscando carritos duplicados...')
        
        # Encontrar usuarios con múltiples carritos
        users_with_duplicates = (
            Cart.objects.values('user')
            .annotate(cart_count=Count('id'))
            .filter(cart_count__gt=1)
        )
        
        if not users_with_duplicates:
            self.stdout.write(self.style.SUCCESS('✅ No se encontraron carritos duplicados'))
            return
        
        total_deleted = 0
        
        for user_data in users_with_duplicates:
            user_id = user_data['user']
            cart_count = user_data['cart_count']
            
            # Obtener todos los carritos del usuario ordenados por fecha de creación
            user_carts = Cart.objects.filter(user_id=user_id).order_by('-created_at')
            
            # Mantener el más reciente (primero en la lista)
            main_cart = user_carts.first()
            duplicate_carts = user_carts.exclude(id=main_cart.id)
            
            # Mover todos los items de los carritos duplicados al carrito principal
            for dup_cart in duplicate_carts:
                items_moved = dup_cart.items.all().update(cart=main_cart)
                if items_moved > 0:
                    self.stdout.write(
                        f'  📦 Movidos {items_moved} items del carrito {dup_cart.id} al {main_cart.id}'
                    )
            
            # Eliminar los carritos duplicados
            deleted_count = duplicate_carts.count()
            duplicate_carts.delete()
            
            total_deleted += deleted_count
            
            self.stdout.write(
                self.style.WARNING(
                    f'  🗑️  Usuario {user_id}: eliminados {deleted_count} carritos duplicados'
                )
            )
        
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Limpieza completada: {total_deleted} carritos duplicados eliminados'
            )
        )
        
        # Mostrar estadísticas finales
        total_carts = Cart.objects.count()
        total_users = Cart.objects.values('user').distinct().count()
        
        self.stdout.write('')
        self.stdout.write('📊 Estadísticas finales:')
        self.stdout.write(f'  - Total de carritos: {total_carts}')
        self.stdout.write(f'  - Total de usuarios con carrito: {total_users}')
