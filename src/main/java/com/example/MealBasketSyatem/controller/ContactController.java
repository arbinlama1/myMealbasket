package com.example.MealBasketSyatem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.MealBasketSyatem.entity.Message;
import com.example.MealBasketSyatem.service.ContactService;

@Controller
@RequestMapping("/contact")
public class ContactController {
    @Autowired
    private ContactService contactService;


    @PostMapping("/send/message")
    public String sendMessage(@ModelAttribute("message") Message message, Model model) {
        contactService.saveMessage(message);
        model.addAttribute("confirmation", "Message sent successfully!");
        model.addAttribute("message", new Message()); // reset form
        return "ContactUs";  // return to ContactUs.html
    }
}
