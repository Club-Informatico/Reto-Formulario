# Versión valida rut de python la tomamos prestada de https://github.com/nocrop/Rut-Chileno-en-Python


from itertools import cycle

def validar_rut_completo_python(rut):
    try:
        rut = rut.upper().replace("-", "").replace(".", "")
        rut_numero = int(rut[:-1])
        dv_ingresado = rut[-1]

        # Comprobación de rangos (opcional)
        if not (1000000 <= rut_numero <= 99999999):
            return False

        # Cálculo del dígito verificador
        reversed_digits = map(int, reversed(str(rut_numero)))
        factors = cycle(range(2, 8))
        s = sum(d * f for d, f in zip(reversed_digits, factors))
        dv_calculado = (-s) % 11

        if dv_calculado == 10:
            dv_calculado_str = 'K'
        else:
            dv_calculado_str = str(dv_calculado)

        return dv_ingresado == dv_calculado_str
    except (ValueError, TypeError):
        return False