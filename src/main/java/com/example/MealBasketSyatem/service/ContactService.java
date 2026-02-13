package com.example.MealBasketSyatem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MealBasketSyatem.entity.Message;
import com.example.MealBasketSyatem.repo.ContactRepo;


@Service
public class ContactService {

    @Autowired
    private ContactRepo contactRepo;

    public List<Message> getAllMessage(){

        return contactRepo.findAll();

    }
    public Message getMessageById(long id) {
        return  contactRepo.findById(id ).orElseThrow(()->new RuntimeException("Message with id"+id+"Not found"));
    }


    public void createMessage(Message Message) {
        contactRepo.save(Message);


    }
    public void updateMessage(Message Message) {

        contactRepo.findById(Message.getId()).orElseThrow(()->new RuntimeException("User with id"+Message.getId()+"Not found"));
        contactRepo.save(Message);

    }
    public void deleteMessage (long id) {
        contactRepo.findById(id).orElseThrow(()->new RuntimeException("user with id"+id+"Not found"));
        contactRepo.deleteById(id);
    }
    public void saveMessage(Message message) {
        contactRepo.save(message);
    }

}
