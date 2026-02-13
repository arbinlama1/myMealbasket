package com.example.MealBasketSyatem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.repo.UserRepo;


@Service
public class UserService {
	@Autowired
	private UserRepo userRepo;
	
	
	public List<User> getAllUser(){
	    	return  userRepo.findAll();
	    	
	     }
	     public User getUserById(long id) {
	    	return  userRepo.findById(id ).orElseThrow(()->new RuntimeException("User with id"+id+"Not found"));
	     }
	     
	     
	     public void createUser(User user) {
	    	 userRepo.save(user);
	    	 
	    	 
	     }
	     public void updateAdmin(User User) {
	    	 
	    	 userRepo.findById(User.getId()).orElseThrow(()->new RuntimeException("User with id"+User.getId()+"Not found"));
	    	 userRepo.save(User);
	    	 
	     }
	     public void deleteUser (long id) {
	    	 userRepo.findById(id).orElseThrow(()->new RuntimeException("user with id"+id+"Not found"));
	    	 userRepo.deleteById(id);
	    	 
	     }
	     
	     public User findUserByEmail(String email) {
	    	 return userRepo.findByEmail(email);
	    	 
	     }
	    public boolean verifyCredentials(String email, String password) {

	    		User User =  userRepo.findByEmail(email);
	    		if(User.getPassword().equals(password)) {
	    			return true;
	    		}
	    		return false;

	    	 
}
		 

}
