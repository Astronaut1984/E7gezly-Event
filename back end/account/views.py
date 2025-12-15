from django.shortcuts import render
from django.db import connection, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import User
import json
import hashlib

# Create your views here.
@csrf_exempt
def countUsers(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_user")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})

@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)     
            hashed = hashlib.sha256(data.get("password").encode()).hexdigest()
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO api_user 
                    (username, password, first_name, last_name, email, status, country, city, phone, wallet, privacy_choice)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [data.get("username"), hashed, data.get("firstName"), data.get("lastName"), data.get("email"), data.get("accountType"), data.get("country"), data.get("city"), data.get("phoneNumber"), 0, 'F'],
                )
            return JsonResponse({"message": "User created successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

@csrf_exempt
def checkEmail(request):
    if request.method not in ["POST", "PUT"]:
        return JsonResponse({"error": "Only POST/PUT methods allowed"}, status=405)
    
    try:
        data = json.loads(request.body)  
        with connection.cursor() as cursor:
            cursor.execute(""" SELECT COUNT(*) FROM api_user WHERE email = %s""",[data.get("email")])
            result = cursor.fetchone()
            if result[0] >= 1:
                return JsonResponse({"emailExists": True})
            return JsonResponse({"emailExists": False})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
        
@csrf_exempt
def me(request):
    username = request.session.get("username")
    if not username:
        return JsonResponse({
            "authenticated": False
        }) 
    try:
        user = User.objects.get(username = username)

        return JsonResponse(
            {
                "authenticated": True,
                "user": {
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "city": user.city,
                    "country": user.country,
                    "status": user.status,
                    "wallet": user.wallet,
                    "phone": user.phone,
                    "email": user.email,
                    "privacy_choice": user.privacy_choice,
                }
            }
        )
    except User.DoesNotExist:
        return JsonResponse({"authenticated": False})

@csrf_exempt
def logout(request):
    request.session.flush()
    return JsonResponse({
        "success": True,
        "message": "Logged Out"
    })

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)    
        hashed = hashlib.sha256(data.get("password").encode()).hexdigest()
        try:
            user = User.objects.get(username=data.get("username"))
            if hashed == user.password:
                request.session['username'] = user.username
                request.session.set_expiry(60 * 60 * 24 * 30)
                return JsonResponse({
                    "success": True,
                    "message": "Logged in",
                    "user": {
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "city": user.city,
                    "country": user.country,
                    "status": user.status,
                    "wallet": user.wallet,
                    "phone": user.phone,
                    "email": user.email,
                    "privacy_choice": user.privacy_choice,
                    }
                })
            else:
                return JsonResponse({"success": False, "message": "Wrong password"})
        except User.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found"})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt    
def checkUsername(request):
    if request.method not in ["POST", "PUT"]:
        return JsonResponse({"error": "Only POST/PUT methods allowed"}, status=405)
    
    try:
        username = json.loads(request.body).get("username")
        if User.objects.filter(username=username).exists():
            return JsonResponse({"usernameExists": True})
        return JsonResponse({"usernameExists": False})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def editAccountInfo(request):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            old_username = request.session.get("username")
            
            if not old_username:
                return JsonResponse({"error": "Not authenticated"}, status=401)
            
            # Get the current user
            user = User.objects.get(username=old_username)
            
            new_username = data.get("username") or user.username
            new_first_name = data.get("firstName") or user.first_name
            new_last_name = data.get("lastName") or user.last_name
            new_email = data.get("email") or user.email
            new_country = data.get("country") or user.country
            new_city = data.get("city") or user.city
            new_phone = data.get("phone") or user.phone
            new_privacy_choice = data.get("privacyChoice") or user.privacy_choice
            
            # Check if username changed
            username_changed = new_username != old_username
            
            if username_changed:
                # Check if new username already exists
                if User.objects.filter(username=new_username).exists():
                    return JsonResponse({"error": "Username already exists"}, status=400)
            
            # Now that CASCADE is set up, we can safely update using raw SQL
            # The database will automatically cascade the username change to all foreign keys
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        UPDATE api_user SET
                        username = %s, 
                        first_name = %s, 
                        last_name = %s, 
                        email = %s, 
                        country = %s, 
                        city = %s, 
                        phone = %s, 
                        privacy_choice = %s
                        WHERE username = %s
                        """,
                        [
                            new_username,
                            new_first_name,
                            new_last_name,
                            new_email,
                            new_country,
                            new_city,
                            new_phone,
                            new_privacy_choice,
                            old_username
                        ]
                    )
            
            # Update session with new username if it changed
            if username_changed:
                request.session['username'] = new_username
            
            # Return updated user data
            return JsonResponse({
                "message": "User updated successfully",
                "user": {
                    "username": new_username,
                    "first_name": new_first_name,
                    "last_name": new_last_name,
                    "email": new_email,
                    "country": new_country,
                    "city": new_city,
                    "phone": new_phone,
                    "privacy_choice": new_privacy_choice,
                    "status": user.status,
                    "wallet": user.wallet
                }
            })
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except Exception as e:
            print(f"Error in editAccountInfo: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only PUT method allowed"}, status=405)
    
@csrf_exempt
def editWallet(request):
    if request.method != "PUT":
        return JsonResponse({"error": "Only PUT method allowed"}, status=405)

    try:
        data = json.loads(request.body)
        amount = int(data.get("amount", 0))

        if amount <= 0:
            return JsonResponse({"error": "Invalid amount"}, status=400)

        username = request.session.get("username")
        if not username:
            return JsonResponse({"error": "Not authenticated"}, status=401)

        with transaction.atomic():
            user = User.objects.select_for_update().get(username=username)
            user.wallet += amount
            user.save(update_fields=["wallet"])

        return JsonResponse({"wallet": user.wallet})

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    except (ValueError, KeyError):
        return JsonResponse({"error": "Invalid request data"}, status=400)

    except Exception as e:
        return JsonResponse({"error": f"Unexpected Error: {e}"}, status=500)
    
@csrf_exempt
def getUserView(request):
    username = json.loads(request.body).get("username")
    user = User.objects.get(username = username)

    return JsonResponse({
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "city": user.city,
        "country": user.country,
        "status": user.status,
        "privacy_choice": user.privacy_choice
    })