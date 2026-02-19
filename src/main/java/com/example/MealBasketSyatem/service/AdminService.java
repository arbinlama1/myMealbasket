package com.example.MealBasketSyatem.service;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.repo.AdminRepo;

@Service
public class AdminService {
	     @Autowired
	private AdminRepo adminRepo;
	
	     @Autowired
	private PasswordEncoder passwordEncoder;

	     public List<Admin>getAllAdmins(){
	    	return adminRepo.findAll();
	    	
	     }
	     public Admin getAdminById(long id) {
	    	return adminRepo.findById(id ).orElseThrow(()->new RuntimeException("admin with id"+id+"Not found"));
	     }
	     

	     public void createUser(Admin admin) {
	    	 adminRepo.save(admin);
	    	 
	    	 
	     }
	     

	     public void updateAdmin(Admin admin) {
	    	 
	    	adminRepo.findById(admin.getId()).orElseThrow(()->new RuntimeException("admin with id"+admin.getId()+"Not found"));
	    	 adminRepo.save(admin);
	    	 
	     }
	     public void deleteAdmin (long id) {
	    	adminRepo.findById(id).orElseThrow(()->new RuntimeException("admin with id"+id+"Not found"));
	    	 adminRepo.deleteById(id);
	    	 
	     }
	     public boolean verifyCredentials(String email, String password) {
	    		Admin admin = findByEmail(email);
	    		if (admin == null) {
	    			return false;
	    		}
	    		return Objects.equals(admin.getPassword(), password);

         }

		 public boolean VerifyCredentials(String email, String password) {
			Admin admin = findByEmail(email);
			if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
				return true;
			}
			return false;
		 }

		 public Admin findByEmail(String email) {
			List<Admin> admins = adminRepo.findAllByEmail(email);
			if (admins == null || admins.isEmpty()) {
				return null;
			}
			return admins.get(0);
		 }
}