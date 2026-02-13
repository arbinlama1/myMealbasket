package com.example.MealBasketSyatem.service;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.repo.AdminRepo;

@Service
public class AdminService {
	     @Autowired
	private AdminRepo adminRepo;

	     public List<Admin>getAllAdmins(){
	    	return  adminRepo.findAll();
	    	
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

	    		Admin admin = adminRepo.findByEmail(email);
             return Objects.equals(admin.getPassword(), password);

         }

		 public boolean VerifyCredentials(String email, String password) {
			// TODO Auto-generated method stub
			return false;
		 }


}